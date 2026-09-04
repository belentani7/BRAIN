import prisma from '../lib/db.js';
import { auditService } from '../audit/service.js';

/**
 * Policy Engine - Authorization and Governance
 * 
 * Separates MODEL INTENT from AUTHORIZED ACTION
 * Architecture: AGENT → ACTION REQUEST → POLICY → AUTHORIZATION → EXECUTION → VERIFICATION → AUDIT
 */

export interface PolicyEvaluationRequest {
  ruleType: 'TOOL_ACCESS' | 'MODEL_SELECTION' | 'COST_LIMIT' | 'DATA_ACCESS' | 'NETWORK_ACCESS' | 'FILE_SYSTEM';
  missionId?: string;
  agentId?: string;
  resourceId?: string;
  resourceType: string;
  requestedAction: string;
  context?: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  action: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'LOG_ONLY';
  reason?: string;
  policyId?: string;
  requiresApproval?: boolean;
}

export class PolicyEngine {
  /**
   * Evaluate a policy request against all enabled policies
   */
  async evaluate(request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult> {
    const { ruleType, missionId, agentId, resourceId, resourceType, requestedAction, context } = request;

    // Load all enabled policies of the matching rule type
    const policies = await prisma.policy.findMany({
      where: {
        ruleType,
        enabled: true,
      },
      orderBy: { priority: 'desc' },
    });

    // Evaluate each policy in priority order
    for (const policy of policies) {
      const condition = JSON.parse(policy.condition);
      
      if (this.matchesCondition(condition, { missionId, agentId, resourceId, resourceType, requestedAction, context })) {
        const result: PolicyEvaluationResult = {
          allowed: policy.action === 'ALLOW',
          action: policy.action,
          reason: policy.description,
          policyId: policy.id,
          requiresApproval: policy.action === 'REQUIRE_APPROVAL',
        };

        // Record evaluation
        await prisma.policyEvaluation.create({
          data: {
            id: crypto.randomUUID(),
            policyId: policy.id,
            missionId: missionId ?? null,
            agentId: agentId ?? null,
            resourceId: resourceId ?? null,
            resourceType,
            requestedAction,
            result: result.allowed ? 'ALLOWED' : (result.requiresApproval ? 'PENDING_APPROVAL' : 'DENIED'),
            reason: result.reason,
          },
        });

        // Audit event
        await auditService.recordEvent({
          eventType: 'POLICY_EVALUATED',
          actor: agentId ?? 'system',
          actorType: agentId ? 'AGENT' : 'SYSTEM',
          action: 'policy_evaluation',
          resource: 'policy',
          missionId,
          policyId: policy.id,
          metadata: {
            ruleType,
            requestedAction,
            result: result.action,
          },
        });

        return result;
      }
    }

    // Default policy: DENY_BY_DEFAULT for sensitive actions
    const defaultDeny = ['TOOL_ACCESS', 'FILE_SYSTEM', 'NETWORK_ACCESS'];
    if (defaultDeny.includes(ruleType)) {
      const result: PolicyEvaluationResult = {
        allowed: false,
        action: 'DENY',
        reason: 'Default deny policy - no matching allow rule found',
      };

      await prisma.policyEvaluation.create({
        data: {
          id: crypto.randomUUID(),
          policyId: 'default',
          missionId: missionId ?? null,
          agentId: agentId ?? null,
          resourceId: resourceId ?? null,
          resourceType,
          requestedAction,
          result: 'DENIED',
          reason: result.reason,
        },
      });

      await auditService.recordEvent({
        eventType: 'POLICY_EVALUATED',
        actor: agentId ?? 'system',
        actorType: agentId ? 'AGENT' : 'SYSTEM',
        action: 'policy_evaluation_default_deny',
        resource: 'policy',
        missionId,
        metadata: {
          ruleType,
          requestedAction,
          result: 'DENY',
        },
      });

      return result;
    }

    // Default: Allow for non-sensitive actions
    return {
      allowed: true,
      action: 'ALLOW',
      reason: 'No restrictive policy matched',
    };
  }

  /**
   * Check if a tool access is authorized
   */
  async checkToolAccess(toolName: string, missionId: string, agentId: string): Promise<PolicyEvaluationResult> {
    return this.evaluate({
      ruleType: 'TOOL_ACCESS',
      missionId,
      agentId,
      resourceId: toolName,
      resourceType: 'tool',
      requestedAction: `execute:${toolName}`,
      context: { toolName },
    });
  }

  /**
   * Check if a model selection is allowed
   */
  async checkModelSelection(modelProvider: string, missionId: string, agentId: string): Promise<PolicyEvaluationResult> {
    return this.evaluate({
      ruleType: 'MODEL_SELECTION',
      missionId,
      agentId,
      resourceId: modelProvider,
      resourceType: 'model',
      requestedAction: `use_model:${modelProvider}`,
      context: { modelProvider },
    });
  }

  /**
   * Check cost limits
   */
  async checkCostLimit(missionId: string, estimatedCost: number): Promise<PolicyEvaluationResult> {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return {
        allowed: false,
        action: 'DENY',
        reason: 'Mission not found',
      };
    }

    const budget = mission.budget ?? Infinity;
    const actualCost = mission.actualCost ?? 0;

    if (actualCost + estimatedCost > budget) {
      const result: PolicyEvaluationResult = {
        allowed: false,
        action: 'DENY',
        reason: `Cost limit exceeded. Budget: ${budget}, Current: ${actualCost}, Estimated: ${estimatedCost}`,
      };

      await auditService.recordEvent({
        eventType: 'POLICY_EVALUATED',
        actor: 'system',
        actorType: 'SYSTEM',
        action: 'cost_limit_exceeded',
        resource: 'mission',
        missionId,
        metadata: { budget, actualCost, estimatedCost },
      });

      return result;
    }

    return {
      allowed: true,
      action: 'ALLOW',
      reason: 'Within budget',
    };
  }

  /**
   * Check network access
   */
  async checkNetworkAccess(url: string, missionId: string, agentId: string): Promise<PolicyEvaluationResult> {
    // Security: Block internal network access (SSRF prevention)
    const blockedPatterns = [
      /^http:\/\/(localhost|127\.0\.0\.1|::1)/,
      /^http:\/\/10\./,
      /^http:\/\/192\.168\./,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\./,
      /^http:\/\/169\.254\./,
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(url)) {
        const result: PolicyEvaluationResult = {
          allowed: false,
          action: 'DENY',
          reason: 'Network access to internal/private addresses blocked (SSRF prevention)',
        };

        await auditService.recordEvent({
          eventType: 'POLICY_EVALUATED',
          actor: agentId,
          actorType: 'AGENT',
          action: 'network_access_blocked',
          resource: 'network',
          missionId,
          metadata: { url, reason: 'SSRF_PREVENTION' },
        });

        return result;
      }
    }

    return this.evaluate({
      ruleType: 'NETWORK_ACCESS',
      missionId,
      agentId,
      resourceId: url,
      resourceType: 'url',
      requestedAction: `access_url:${url}`,
      context: { url },
    });
  }

  /**
   * Check file system access
   */
  async checkFileSystemAccess(path: string, operation: 'read' | 'write' | 'execute', missionId: string, agentId: string): Promise<PolicyEvaluationResult> {
    // Security: Prevent path traversal
    if (path.includes('..')) {
      const result: PolicyEvaluationResult = {
        allowed: false,
        action: 'DENY',
        reason: 'Path traversal detected',
      };

      await auditService.recordEvent({
        eventType: 'POLICY_EVALUATED',
        actor: agentId,
        actorType: 'AGENT',
        action: 'filesystem_access_blocked',
        resource: 'file',
        missionId,
        metadata: { path, operation, reason: 'PATH_TRAVERSAL' },
      });

      return result;
    }

    // Security: Block sensitive paths
    const blockedPaths = ['/etc', '/proc', '/sys', '/root', '/var/log'];
    for (const blocked of blockedPaths) {
      if (path.startsWith(blocked)) {
        const result: PolicyEvaluationResult = {
          allowed: false,
          action: 'DENY',
          reason: `Access to ${blocked} is restricted`,
        };

        await auditService.recordEvent({
          eventType: 'POLICY_EVALUATED',
          actor: agentId,
          actorType: 'AGENT',
          action: 'filesystem_access_blocked',
          resource: 'file',
          missionId,
          metadata: { path, operation, reason: 'SENSITIVE_PATH' },
        });

        return result;
      }
    }

    return this.evaluate({
      ruleType: 'FILE_SYSTEM',
      missionId,
      agentId,
      resourceId: path,
      resourceType: 'file',
      requestedAction: `${operation}:${path}`,
      context: { path, operation },
    });
  }

  /**
   * Check data access
   */
  async checkDataAccess(resourceType: string, resourceId: string, operation: 'read' | 'write' | 'delete', missionId: string, agentId: string): Promise<PolicyEvaluationResult> {
    return this.evaluate({
      ruleType: 'DATA_ACCESS',
      missionId,
      agentId,
      resourceId,
      resourceType,
      requestedAction: `${operation}:${resourceType}:${resourceId}`,
      context: { operation },
    });
  }

  /**
   * Helper to match conditions
   */
  private matchesCondition(condition: Record<string, unknown>, context: {
    missionId?: string;
    agentId?: string;
    resourceId?: string;
    resourceType: string;
    requestedAction: string;
    context?: Record<string, unknown>;
  }): boolean {
    // Simple condition matching - can be extended with more complex logic
    for (const [key, expectedValue] of Object.entries(condition)) {
      const actualValue = key === 'requestedAction' 
        ? context.requestedAction 
        : key === 'resourceType'
        ? context.resourceType
        : key === 'missionId'
        ? context.missionId
        : key === 'agentId'
        ? context.agentId
        : key === 'resourceId'
        ? context.resourceId
        : context.context?.[key];

      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) {
          return false;
        }
      } else if (typeof expectedValue === 'object' && expectedValue !== null) {
        // Handle regex patterns
        if ('regex' in expectedValue) {
          const regex = new RegExp(expectedValue.regex as string);
          if (!regex.test(String(actualValue))) {
            return false;
          }
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create a default set of policies
   */
  async createDefaultPolicies(): Promise<void> {
    const defaultPolicies = [
      {
        name: 'deny_unauthorized_tool_access',
        description: 'Deny tool access without explicit authorization',
        ruleType: 'TOOL_ACCESS' as const,
        condition: JSON.stringify({}),
        action: 'DENY' as const,
        priority: 100,
      },
      {
        name: 'allow_approved_tools',
        description: 'Allow tools that have been pre-approved',
        ruleType: 'TOOL_ACCESS' as const,
        condition: JSON.stringify({ approved: true }),
        action: 'ALLOW' as const,
        priority: 90,
      },
      {
        name: 'block_internal_network',
        description: 'Block access to internal network addresses (SSRF prevention)',
        ruleType: 'NETWORK_ACCESS' as const,
        condition: JSON.stringify({ internal: true }),
        action: 'DENY' as const,
        priority: 100,
      },
      {
        name: 'cost_budget_limit',
        description: 'Enforce mission budget limits',
        ruleType: 'COST_LIMIT' as const,
        condition: JSON.stringify({ exceedsBudget: true }),
        action: 'DENY' as const,
        priority: 100,
      },
      {
        name: 'require_approval_high_risk',
        description: 'Require approval for high-risk operations',
        ruleType: 'TOOL_ACCESS' as const,
        condition: JSON.stringify({ riskLevel: 'HIGH' }),
        action: 'REQUIRE_APPROVAL' as const,
        priority: 95,
      },
    ];

    for (const policy of defaultPolicies) {
      try {
        await prisma.policy.upsert({
          where: { name: policy.name },
          update: policy,
          create: {
            id: crypto.randomUUID(),
            ...policy,
          },
        });
      } catch {
        // Policy already exists or error
      }
    }
  }
}

export const policyEngine = new PolicyEngine();
