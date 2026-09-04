import { createHash } from 'crypto';

/**
 * SHA-256 Audit Ledger - Cryptographically chained event logging
 * Each event contains the hash of the previous event, creating an immutable chain
 */

export interface AuditEventData {
  eventType: string;
  actor: string;
  actorType: 'USER' | 'AGENT' | 'SYSTEM' | 'EXTERNAL';
  missionId?: string;
  agentId?: string;
  toolId?: string;
  action: string;
  resource?: string;
  input?: unknown;
  output?: unknown;
  metadata?: Record<string, unknown>;
}

export interface AuditEventRecord extends AuditEventData {
  id: string;
  previousHash: string | null;
  currentHash: string;
  timestamp: Date;
  verified: boolean;
}

export class AuditLedger {
  private lastHash: string | null = null;

  /**
   * Compute SHA-256 hash of data
   */
  computeHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create a new audit event with cryptographic chaining
   */
  async createEvent(eventData: AuditEventData): Promise<AuditEventRecord> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    
    // Serialize event data for hashing
    const eventDataStr = JSON.stringify({
      id,
      ...eventData,
      timestamp: timestamp.toISOString(),
      previousHash: this.lastHash,
    });

    // Compute current hash including previous hash for chaining
    const currentHash = this.computeHash(eventDataStr);

    const record: AuditEventRecord = {
      id,
      ...eventData,
      previousHash: this.lastHash,
      currentHash,
      timestamp,
      verified: false,
    };

    // Update last hash for next event
    this.lastHash = currentHash;

    return record;
  }

  /**
   * Verify the integrity of an event chain
   */
  verifyChain(events: AuditEventRecord[]): { valid: boolean; invalidIndex?: number; reason?: string } {
    let expectedPreviousHash: string | null = null;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      // Check previous hash linkage
      if (event.previousHash !== expectedPreviousHash) {
        return {
          valid: false,
          invalidIndex: i,
          reason: `Event ${i} has invalid previousHash linkage`,
        };
      }

      // Recompute hash and verify
      const eventDataStr = JSON.stringify({
        id: event.id,
        eventType: event.eventType,
        actor: event.actor,
        actorType: event.actorType,
        missionId: event.missionId,
        agentId: event.agentId,
        toolId: event.toolId,
        action: event.action,
        resource: event.resource,
        input: event.input,
        output: event.output,
        metadata: event.metadata,
        timestamp: event.timestamp.toISOString(),
        previousHash: event.previousHash,
      });

      const recomputedHash = this.computeHash(eventDataStr);

      if (recomputedHash !== event.currentHash) {
        return {
          valid: false,
          invalidIndex: i,
          reason: `Event ${i} has invalid hash - data may have been tampered`,
        };
      }

      expectedPreviousHash = event.currentHash;
    }

    return { valid: true };
  }

  /**
   * Get the current tip hash (for verification on restart)
   */
  getTipHash(): string | null {
    return this.lastHash;
  }

  /**
   * Reset ledger state (use with caution - only for testing)
   */
  reset(): void {
    this.lastHash = null;
  }

  /**
   * Set the tip hash (for restoring state after restart)
   */
  setTipHash(hash: string | null): void {
    this.lastHash = hash;
  }
}

// Singleton instance
export const auditLedger = new AuditLedger();
