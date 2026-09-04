import prisma from '../lib/db.js';
import { auditService } from '../audit/service.js';
import { CreateMissionInputSchema, type Mission, type CreateMissionInput } from '../lib/types.js';
import { MissionStatus } from '@prisma/client';

/**
 * Mission Runtime - Full lifecycle management
 * STATES: CREATED → DISCOVERING → PLANNING → AUTHORIZED → EXECUTING → VERIFYING → COMPLETED/FAILED
 */

export class MissionRuntime {
  /**
   * Create a new mission
   */
  async createMission(input: CreateMissionInput): Promise<Mission> {
    const validated = CreateMissionInputSchema.parse(input);

    // Record audit event
    await auditService.recordEvent({
      eventType: 'MISSION_CREATED',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'create_mission',
      resource: 'mission',
      input: validated,
      metadata: { title: validated.title },
    });

    const mission = await prisma.mission.create({
      data: {
        id: crypto.randomUUID(),
        title: validated.title,
        objective: validated.objective,
        description: validated.description,
        priority: validated.priority,
        status: MissionStatus.CREATED,
        budget: validated.budget,
        deadline: validated.deadline,
        parentMissionId: validated.parentMissionId,
      },
    });

    return mission as unknown as Mission;
  }

  /**
   * Start mission discovery phase
   */
  async startDiscovery(missionId: string): Promise<void> {
    await this.transitionStatus(missionId, MissionStatus.DISCOVERING);
    
    await auditService.recordEvent({
      eventType: 'MISSION_STARTED',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'start_discovery',
      missionId,
      resource: 'mission',
    });
  }

  /**
   * Transition to planning phase
   */
  async startPlanning(missionId: string): Promise<void> {
    await this.transitionStatus(missionId, MissionStatus.PLANNING);
    
    await auditService.recordEvent({
      eventType: 'MISSION_PLANNING',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'start_planning',
      missionId,
      resource: 'mission',
    });
  }

  /**
   * Authorize mission for execution
   */
  async authorizeMission(missionId: string, authorizedBy: string): Promise<void> {
    await this.transitionStatus(missionId, MissionStatus.AUTHORIZED);
    
    await auditService.recordEvent({
      eventType: 'MISSION_AUTHORIZED',
      actor: authorizedBy,
      actorType: 'USER',
      action: 'authorize_mission',
      missionId,
      resource: 'mission',
    });
  }

  /**
   * Start execution phase
   */
  async startExecution(missionId: string): Promise<void> {
    await this.transitionStatus(missionId, MissionStatus.EXECUTING);
    
    await auditService.recordEvent({
      eventType: 'MISSION_EXECUTING',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'start_execution',
      missionId,
      resource: 'mission',
    });
  }

  /**
   * Start verification phase
   */
  async startVerification(missionId: string): Promise<void> {
    await this.transitionStatus(missionId, MissionStatus.VERIFYING);
    
    await auditService.recordEvent({
      eventType: 'MISSION_VERIFYING',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'start_verification',
      missionId,
      resource: 'mission',
    });
  }

  /**
   * Complete mission successfully
   */
  async completeMission(missionId: string): Promise<void> {
    await prisma.mission.update({
      where: { id: missionId },
      data: {
        status: MissionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await auditService.recordEvent({
      eventType: 'MISSION_COMPLETED',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'complete_mission',
      missionId,
      resource: 'mission',
    });
  }

  /**
   * Mark mission as failed
   */
  async failMission(missionId: string, reason?: string): Promise<void> {
    await prisma.mission.update({
      where: { id: missionId },
      data: {
        status: MissionStatus.FAILED,
        failedAt: new Date(),
      },
    });

    await auditService.recordEvent({
      eventType: 'MISSION_FAILED',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'fail_mission',
      missionId,
      resource: 'mission',
      metadata: { reason },
    });
  }

  /**
   * Cancel mission
   */
  async cancelMission(missionId: string, reason?: string): Promise<void> {
    await prisma.mission.update({
      where: { id: missionId },
      data: {
        status: MissionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await auditService.recordEvent({
      eventType: 'MISSION_CANCELLED',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'cancel_mission',
      missionId,
      resource: 'mission',
      metadata: { reason },
    });
  }

  /**
   * Create checkpoint for recovery
   */
  async createCheckpoint(missionId: string, state: Record<string, unknown>, reason?: string): Promise<void> {
    await prisma.checkpoint.create({
      data: {
        id: crypto.randomUUID(),
        missionId,
        state: JSON.stringify(state),
        reason: reason ?? 'periodic',
        recoverable: true,
      },
    });

    await auditService.recordEvent({
      eventType: 'CHECKPOINT_CREATED',
      actor: 'system',
      actorType: 'SYSTEM',
      action: 'create_checkpoint',
      missionId,
      resource: 'checkpoint',
      metadata: { reason },
    });
  }

  /**
   * Get latest checkpoint for recovery
   */
  async getLatestCheckpoint(missionId: string) {
    return prisma.checkpoint.findFirst({
      where: { missionId, recoverable: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Restore mission from checkpoint
   */
  async restoreFromCheckpoint(missionId: string): Promise<Record<string, unknown> | null> {
    const checkpoint = await this.getLatestCheckpoint(missionId);
    
    if (!checkpoint) {
      return null;
    }

    return JSON.parse(checkpoint.state) as Record<string, unknown>;
  }

  /**
   * Helper to transition status with validation
   */
  private async transitionStatus(missionId: string, newStatus: MissionStatus): Promise<void> {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    // Validate state transition
    const validTransitions: Record<MissionStatus, MissionStatus[]> = {
      [MissionStatus.CREATED]: [MissionStatus.DISCOVERING, MissionStatus.CANCELLED],
      [MissionStatus.DISCOVERING]: [MissionStatus.PLANNING, MissionStatus.BLOCKED, MissionStatus.FAILED],
      [MissionStatus.PLANNING]: [MissionStatus.AUTHORIZED, MissionStatus.REPLANNING, MissionStatus.FAILED],
      [MissionStatus.AUTHORIZED]: [MissionStatus.EXECUTING, MissionStatus.CANCELLED],
      [MissionStatus.EXECUTING]: [MissionStatus.VERIFYING, MissionStatus.REPLANNING, MissionStatus.FAILED],
      [MissionStatus.VERIFYING]: [MissionStatus.COMPLETED, MissionStatus.REPLANNING, MissionStatus.FAILED],
      [MissionStatus.REPLANNING]: [MissionStatus.PLANNING, MissionStatus.FAILED],
      [MissionStatus.BLOCKED]: [MissionStatus.PLANNING, MissionStatus.CANCELLED],
      [MissionStatus.FAILED]: [],
      [MissionStatus.COMPLETED]: [],
      [MissionStatus.CANCELLED]: [],
    };

    if (!validTransitions[mission.status as MissionStatus].includes(newStatus)) {
      throw new Error(
        `Invalid state transition from ${mission.status} to ${newStatus}`
      );
    }

    await prisma.mission.update({
      where: { id: missionId },
      data: { status: newStatus },
    });
  }

  /**
   * Get mission by ID
   */
  async getMission(missionId: string): Promise<Mission | null> {
    return prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        agents: true,
        tools: true,
        checkpoints: true,
        artifacts: true,
        auditEvents: {
          orderBy: { timestamp: 'asc' },
        },
      },
    }) as Promise<Mission | null>;
  }

  /**
   * List all missions
   */
  async listMissions(status?: MissionStatus) {
    return prisma.mission.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const missionRuntime = new MissionRuntime();
