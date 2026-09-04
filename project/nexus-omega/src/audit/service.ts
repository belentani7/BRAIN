import { auditLedger } from './ledger.js';
import prisma from '../lib/db.js';
import type { AuditEventData } from './ledger.js';
import { AuditEventType, ActorType } from '@prisma/client';

/**
 * Persistent Audit Service
 * Integrates in-memory ledger with database persistence
 */

export class AuditService {
  /**
   * Record an audit event to both ledger and database
   */
  async recordEvent(eventData: AuditEventData): Promise<void> {
    // Create event in ledger first (for hash chaining)
    const ledgerRecord = await auditLedger.createEvent(eventData);

    // Persist to database
    await prisma.auditEvent.create({
      data: {
        id: ledgerRecord.id,
        eventType: eventData.eventType as AuditEventType,
        actor: eventData.actor,
        actorType: eventData.actorType as ActorType,
        missionId: eventData.missionId,
        agentId: eventData.agentId,
        toolId: eventData.toolId,
        action: eventData.action,
        resource: eventData.resource,
        inputHash: eventData.input ? auditLedger.computeHash(JSON.stringify(eventData.input)) : null,
        outputHash: eventData.output ? auditLedger.computeHash(JSON.stringify(eventData.output)) : null,
        previousHash: ledgerRecord.previousHash,
        currentHash: ledgerRecord.currentHash,
        metadata: eventData.metadata ? JSON.stringify(eventData.metadata) : null,
        timestamp: ledgerRecord.timestamp,
        verified: false,
      },
    });
  }

  /**
   * Verify the entire audit chain from database
   */
  async verifyChain(): Promise<{ valid: boolean; invalidIndex?: number; reason?: string }> {
    const events = await prisma.auditEvent.findMany({
      orderBy: { timestamp: 'asc' },
    });

    const ledgerEvents = events.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      actor: e.actor,
      actorType: e.actorType,
      missionId: e.missionId ?? undefined,
      agentId: e.agentId ?? undefined,
      toolId: e.toolId ?? undefined,
      action: e.action,
      resource: e.resource ?? undefined,
      inputHash: e.inputHash ?? undefined,
      outputHash: e.outputHash ?? undefined,
      previousHash: e.previousHash ?? null,
      currentHash: e.currentHash,
      timestamp: e.timestamp,
      verified: e.verified,
    }));

    return auditLedger.verifyChain(ledgerEvents);
  }

  /**
   * Get events for a specific mission
   */
  async getMissionEvents(missionId: string) {
    return prisma.auditEvent.findMany({
      where: { missionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Get recent events
   */
  async getRecentEvents(limit: number = 100) {
    return prisma.auditEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Restore ledger state from last database event
   */
  async restoreState(): Promise<void> {
    const lastEvent = await prisma.auditEvent.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    if (lastEvent) {
      auditLedger.setTipHash(lastEvent.currentHash);
    } else {
      auditLedger.reset();
    }
  }

  /**
   * Mark event as verified
   */
  async markVerified(eventId: string): Promise<void> {
    await prisma.auditEvent.update({
      where: { id: eventId },
      data: { verified: true },
    });
  }
}

export const auditService = new AuditService();
