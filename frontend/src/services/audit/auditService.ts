/**
 * Client-side audit trail service.
 *
 * Records critical user actions (who changed what, when) and ships them to the
 * backend in batches. Batching keeps request volume low while still giving
 * security/analytics a durable trail of user activity.
 *
 * Controlled by the VITE_ENABLE_AUDIT_LOGGING environment flag. When the flag
 * is not "true" (e.g. local dev), events are dropped instead of sent.
 */

export type AuditAction =
  | 'shipment.created'
  | 'shipment.updated'
  | 'settings.changed'
  | 'team.member.added'
  | 'team.member.removed'
  | 'wallet.connected'
  | 'wallet.disconnected';

export interface AuditEvent {
  action: AuditAction;
  /** ISO timestamp of when the action occurred. */
  timestamp: string;
  /** Optional structured details about the action (ids, changed fields, etc.). */
  metadata?: Record<string, unknown>;
}

const AUDIT_ENDPOINT = '/api/audit/events';
const FLUSH_INTERVAL_MS = 30_000;
const MAX_BATCH_SIZE = 50;

function isAuditEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_AUDIT_LOGGING === 'true';
}

class AuditService {
  private queue: AuditEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (isAuditEnabled() && typeof window !== 'undefined') {
      this.flushTimer = setInterval(() => {
        void this.flush();
      }, FLUSH_INTERVAL_MS);
    }
  }

  /**
   * Record a critical user action. Queues the event and flushes immediately
   * once the batch size is reached.
   */
  log(action: AuditAction, metadata?: Record<string, unknown>): void {
    if (!isAuditEnabled()) {
      return;
    }

    this.queue.push({
      action,
      timestamp: new Date().toISOString(),
      metadata,
    });

    if (this.queue.length >= MAX_BATCH_SIZE) {
      void this.flush();
    }
  }

  /** Send all queued events to the backend. Safe to call at any time. */
  async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue;
    this.queue = [];

    try {
      const response = await fetch(AUDIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error(`Audit flush failed with status ${response.status}`);
      }
    } catch (error) {
      // Re-queue so events are not silently lost, but cap the buffer to avoid
      // unbounded growth if the backend is unavailable.
      this.queue = [...batch, ...this.queue].slice(-MAX_BATCH_SIZE * 2);
      console.warn('[audit] failed to send audit events', error);
    }
  }

  /** Stop the periodic flush timer (useful for tests / teardown). */
  dispose(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

export const auditService = new AuditService();
export default auditService;
