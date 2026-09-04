import prisma from '../lib/db.js';
import { auditService } from '../audit/service.js';
import type { AgentStatus } from '@prisma/client';

/**
 * Agent Runtime - Autonomous AI Agent Lifecycle Management
 * 
 * STATES: IDLE → SPAWN → INITIALIZING → CONTEXT_LOADING → REASONING → 
 *         REQUESTING_TOOL → EXECUTING → OBSERVING → VERIFYING → REPORTING → IDLE
 */

export interface AgentConfig {
  identity: string;
  role: string;
  capabilities: string[];
  modelProvider?: string;
  modelConfig?: Record<string, unknown>;
  contextLimit?: number;
  tokenBudget?: number;
  timeout?: number;
  sandboxEnabled?: boolean;
}

export interface AgentExecutionRequest {
  missionId: string;
  action: string;
  input?: Record<string, unknown>;
}

export class AgentRuntime {
  private activeAgents: Map<string, AgentConfig> = new Map();

  /**
   * Spawn a new agent for a mission
   */
  async spawnAgent(missionId: string, config: AgentConfig): Promise<string> {
    const agentId = crypto.randomUUID();

    // Create agent record
    const agentRecord = await prisma.agent.create({
      data: {
        id: agentId,
        identity: config.identity,
        role: config.role,
        capabilities: JSON.stringify(config.capabilities),
        status: 'SPAWN',
        currentMissionId: missionId,
        modelProvider: config.modelProvider ?? 'openai',
        modelConfig: config.modelConfig ? JSON.stringify(config.modelConfig) : null,
        contextLimit: config.contextLimit ?? 4096,
        tokenBudget: config.tokenBudget ?? null,
        timeout: config.timeout ?? 60000,
        sandboxEnabled: config.sandboxEnabled ?? true,
      },
    });

    // Update mission with agent assignment
    await prisma.mission.update({
      where: { id: missionId },
      data: {
        agents: {
          connect: { id: agentId },
        },
      },
    });

    // Transition to initializing
    await this.transitionStatus(agentId, 'INITIALIZING');

    // Audit event
    await auditService.recordEvent({
      eventType: 'AGENT_SPAWNED',
      actor: agentId,
      actorType: 'SYSTEM',
      action: 'spawn_agent',
      resource: 'agent',
      missionId,
      metadata: {
        identity: config.identity,
        role: config.role,
        capabilities: config.capabilities,
      },
    });

    this.activeAgents.set(agentId, config);

    return agentId;
  }

  /**
   * Load context for agent (memory, mission state, tools)
   */
  async loadContext(agentId: string, missionId: string): Promise<void> {
    await this.transitionStatus(agentId, 'CONTEXT_LOADING');

    // Load short-term memory
    const memories = await prisma.memory.findMany({
      where: {
        OR: [
          { scope: 'GLOBAL' },
          { scope: 'MISSION', missionId },
          { scope: 'AGENT', agentId },
        ],
      },
      orderBy: { lastAccessedAt: 'desc' },
      take: 50,
    });

    // Load mission state
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        agents: true,
        tools: true,
        checkpoints: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        artifacts: true,
      },
    });

    // Store in agent's working memory
    await prisma.memory.create({
      data: {
        id: crypto.randomUUID(),
        type: 'MISSION_CONTEXT',
        scope: 'AGENT',
        key: `agent_${agentId}_mission_context`,
        value: JSON.stringify({
          mission: mission ? {
            id: mission.id,
            title: mission.title,
            objective: mission.objective,
            status: mission.status,
          } : null,
          memoryCount: memories.length,
          loadedAt: new Date().toISOString(),
        }),
        agentId,
        missionId,
        confidence: 1.0,
      },
    });

    await this.transitionStatus(agentId, 'REASONING');

    await auditService.recordEvent({
      eventType: 'AGENT_ACTION',
      actor: agentId,
      actorType: 'AGENT',
      action: 'context_loaded',
      resource: 'memory',
      missionId,
      metadata: { memoryCount: memories.length },
    });
  }

  /**
   * Execute an action with the agent
   */
  async executeAction(request: AgentExecutionRequest): Promise<{ success: boolean; output?: unknown; error?: string }> {
    const { missionId, action, input } = request;

    // Find agent by current execution context
    const executions = await prisma.agentExecution.findMany({
      where: { missionId, status: 'PENDING' },
      orderBy: { startedAt: 'asc' },
      take: 1,
    });

    if (executions.length === 0) {
      return { success: false, error: 'No pending execution found' };
    }

    const execution = executions[0];
    const agentId = execution.agentId;

    // Transition agent to executing
    await this.transitionStatus(agentId, 'EXECUTING');

    // Update execution status
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'RUNNING',
        input: input ? JSON.stringify(input) : null,
      },
    });

    try {
      // Here would be the actual AI model invocation
      // For now, we simulate based on action type
      let output: unknown;

      switch (action) {
        case 'analyze_repository':
          output = await this.analyzeRepository(input as { owner: string; repo: string });
          break;
        case 'generate_plan':
          output = await this.generatePlan(missionId, input as { objective: string });
          break;
        case 'execute_tool':
          output = await this.executeTool(agentId, missionId, input as { toolName: string; params: Record<string, unknown> });
          break;
        case 'verify_result':
          output = await this.verifyResult(missionId, input as { resourceId: string; resourceType: string });
          break;
        default:
          output = { action, status: 'completed', timestamp: new Date().toISOString() };
      }

      // Mark execution as completed
      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          output: output ? JSON.stringify(output) : null,
          completedAt: new Date(),
        },
      });

      await this.transitionStatus(agentId, 'OBSERVING');

      // Audit
      await auditService.recordEvent({
        eventType: 'AGENT_ACTION',
        actor: agentId,
        actorType: 'AGENT',
        action,
        resource: 'execution',
        missionId,
        input,
        output: output as Record<string, unknown>,
      });

      return { success: true, output };
    } catch (error) {
      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: String(error),
          completedAt: new Date(),
        },
      });

      await this.transitionStatus(agentId, 'ERROR');

      await auditService.recordEvent({
        eventType: 'ERROR_OCCURRED',
        actor: agentId,
        actorType: 'AGENT',
        action,
        resource: 'execution',
        missionId,
        metadata: { error: String(error) },
      });

      return { success: false, error: String(error) };
    }
  }

  /**
   * Request tool access (goes through policy engine)
   */
  async requestTool(agentId: string, missionId: string, toolName: string, params: Record<string, unknown>): Promise<{ authorized: boolean; error?: string }> {
    await this.transitionStatus(agentId, 'REQUESTING_TOOL');

    // Check if tool exists
    const tool = await prisma.tool.findUnique({
      where: { name: toolName },
    });

    if (!tool) {
      return { authorized: false, error: `Tool ${toolName} not found` };
    }

    if (!tool.enabled) {
      return { authorized: false, error: `Tool ${toolName} is disabled` };
    }

    // Policy check will be done by policy engine
    // Create tool usage record - authorization handled separately
    await prisma.toolUsage.create({
      data: {
        id: crypto.randomUUID(),
        toolId: tool.id,
        missionId,
        agentId,
        input: JSON.stringify(params),
        status: 'PENDING',
      },
    });

    await auditService.recordEvent({
      eventType: 'TOOL_REQUESTED',
      actor: agentId,
      actorType: 'AGENT',
      action: 'request_tool',
      resource: 'tool',
      missionId,
      toolId: tool.id,
      metadata: { toolName, params },
    });

    return { authorized: true };
  }

  /**
   * Report result back to mission
   */
  async reportResult(agentId: string, missionId: string, result: Record<string, unknown>): Promise<void> {
    await this.transitionStatus(agentId, 'REPORTING');

    // Create artifact if applicable
    if ('artifact' in result && result.artifact) {
      const artifactData = result.artifact as Record<string, unknown>;
      await prisma.artifact.create({
        data: {
          id: crypto.randomUUID(),
          missionId,
          name: (artifactData.name as string) ?? `artifact_${Date.now()}`,
          type: (artifactData.type as string) ?? 'data',
          content: typeof artifactData.content === 'string' 
            ? artifactData.content as string
            : JSON.stringify(artifactData.content),
          contentHash: crypto.randomUUID(), // Should compute actual hash
          size: JSON.stringify(artifactData.content).length,
        },
      });
    }

    // Store in memory
    await prisma.memory.create({
      data: {
        id: crypto.randomUUID(),
        type: 'TOOL_RESULT',
        scope: 'MISSION',
        key: `mission_${missionId}_agent_${agentId}_result`,
        value: JSON.stringify(result),
        missionId,
        agentId,
        confidence: 1.0,
      },
    });

    // Return agent to idle if no more work
    await this.transitionStatus(agentId, 'IDLE');

    await auditService.recordEvent({
      eventType: 'AGENT_ACTION',
      actor: agentId,
      actorType: 'AGENT',
      action: 'report_result',
      resource: 'mission',
      missionId,
      output: result,
    });
  }

  /**
   * Helper methods for specific actions
   */
  private async analyzeRepository(input: { owner: string; repo: string }): Promise<Record<string, unknown>> {
    // Placeholder - would integrate with GitHub service
    return {
      analyzed: true,
      repository: `${input.owner}/${input.repo}`,
      timestamp: new Date().toISOString(),
      status: 'analysis_complete',
    };
  }

  private async generatePlan(missionId: string, input: { objective: string }): Promise<Record<string, unknown>> {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    // Generate plan structure
    const plan = {
      missionId,
      objective: input.objective,
      phases: [
        { name: 'discovery', status: 'pending' },
        { name: 'planning', status: 'pending' },
        { name: 'execution', status: 'pending' },
        { name: 'verification', status: 'pending' },
      ],
      createdAt: new Date().toISOString(),
    };

    return plan;
  }

  private async executeTool(
    _agentId: string,
    _missionId: string,
    input: { toolName: string; params: Record<string, unknown> }
  ): Promise<Record<string, unknown>> {
    // This would integrate with the actual tool runtime
    return {
      toolExecuted: input.toolName,
      params: input.params,
      timestamp: new Date().toISOString(),
      status: 'simulated',
    };
  }

  private async verifyResult(
    _missionId: string,
    input: { resourceId: string; resourceType: string }
  ): Promise<Record<string, unknown>> {
    // This would integrate with verification engine
    return {
      verified: true,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      timestamp: new Date().toISOString(),
      method: 'automated',
    };
  }

  /**
   * Transition agent status with validation
   */
  private async transitionStatus(agentId: string, newStatus: AgentStatus): Promise<void> {
    const validTransitions: Record<AgentStatus, AgentStatus[]> = {
      IDLE: ['SPAWN', 'ERROR'],
      SPAWN: ['INITIALIZING', 'ERROR'],
      INITIALIZING: ['CONTEXT_LOADING', 'ERROR'],
      CONTEXT_LOADING: ['REASONING', 'ERROR'],
      REASONING: ['REQUESTING_TOOL', 'EXECUTING', 'REPORTING', 'ERROR'],
      REQUESTING_TOOL: ['EXECUTING', 'ERROR'],
      EXECUTING: ['OBSERVING', 'VERIFYING', 'ERROR'],
      OBSERVING: ['REASONING', 'REPORTING', 'ERROR'],
      VERIFYING: ['REPORTING', 'REASONING', 'ERROR'],
      REPORTING: ['IDLE', 'ERROR'],
      ERROR: ['IDLE'],
    };

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const currentStatus = agent.status as AgentStatus;
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Invalid state transition from ${currentStatus} to ${newStatus}`
      );
    }

    await prisma.agent.update({
      where: { id: agentId },
      data: { status: newStatus },
    });
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string) {
    return prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        auditEvents: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    });
  }

  /**
   * List agents by status
   */
  async listAgents(status?: AgentStatus) {
    return prisma.agent.findMany({
      where: status ? { status } : {},
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Cleanup agent resources
   */
  async cleanupAgent(agentId: string): Promise<void> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return;
    }

    // Clear current mission assignment
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        status: 'IDLE',
        currentMissionId: null,
      },
    });

    this.activeAgents.delete(agentId);

    await auditService.recordEvent({
      eventType: 'AGENT_ACTION',
      actor: agentId,
      actorType: 'AGENT',
      action: 'cleanup',
      resource: 'agent',
    });
  }
}

export const agentRuntime = new AgentRuntime();
