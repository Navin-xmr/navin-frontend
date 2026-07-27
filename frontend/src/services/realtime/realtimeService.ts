import type { RealtimeEvent, RealtimeEventType } from '../../types/realtimeEvents';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

type Handler<T extends RealtimeEvent = RealtimeEvent> = (event: T) => void;

const SSE_ENDPOINT = '/api/events';
const MAX_RETRIES = 3;
const FALLBACK_POLL_INTERVAL_MS = 15_000;
const MAX_BACKOFF_MS = 30_000;

function backoffDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), MAX_BACKOFF_MS);
}

export class RealtimeService {
  private eventSource: EventSource | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  private useFallback = false;
  private closed = false;

  private handlers = new Map<RealtimeEventType, Set<Handler>>();
  private statusHandlers = new Set<(status: ConnectionStatus) => void>();

  private _status: ConnectionStatus = 'disconnected';

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(s: ConnectionStatus) {
    this._status = s;
    this.statusHandlers.forEach((h) => h(s));
  }

  connect(): void {
    if (this.closed) return;
    if (!('EventSource' in window) || this.useFallback) {
      this.startPolling();
      return;
    }
    this.openSSE();
  }

  private openSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.setStatus('reconnecting');
    const es = new EventSource(SSE_ENDPOINT, { withCredentials: true });
    this.eventSource = es;

    es.onopen = () => {
      this.retryCount = 0;
      this.setStatus('connected');
    };

    es.onmessage = (e: MessageEvent) => {
      this.dispatch(e.data as string);
    };

    es.onerror = () => {
      es.close();
      this.eventSource = null;
      this.setStatus('reconnecting');

      if (this.closed) return;

      if (this.retryCount >= MAX_RETRIES) {
        this.useFallback = true;
        this.startPolling();
        return;
      }

      const delay = backoffDelay(this.retryCount);
      this.retryCount++;
      this.retryTimer = setTimeout(() => {
        if (!this.closed) this.openSSE();
      }, delay);
    };
  }

  private startPolling(): void {
    this.setStatus('disconnected');
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => {
      void this.poll();
    }, FALLBACK_POLL_INTERVAL_MS);
  }

  private async poll(): Promise<void> {
    try {
      const res = await fetch('/api/events/poll', { credentials: 'include' });
      if (!res.ok) return;
      const events = (await res.json()) as RealtimeEvent[];
      events.forEach((ev) => this.emit(ev));
      this.setStatus('connected');
    } catch {
      this.setStatus('disconnected');
    }
  }

  private dispatch(raw: string): void {
    try {
      const ev = JSON.parse(raw) as RealtimeEvent;
      this.emit(ev);
    } catch {
      // ignore malformed events
    }
  }

  private emit(ev: RealtimeEvent): void {
    const bucket = this.handlers.get(ev.type);
    if (bucket) {
      bucket.forEach((h) => (h as Handler<typeof ev>)(ev));
    }
  }

  subscribe<T extends RealtimeEvent>(eventType: T['type'], handler: Handler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as Handler);
  }

  unsubscribe<T extends RealtimeEvent>(eventType: T['type'], handler: Handler<T>): void {
    this.handlers.get(eventType)?.delete(handler as Handler);
  }

  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  disconnect(): void {
    this.closed = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.setStatus('disconnected');
  }

  reset(): void {
    this.closed = false;
    this.retryCount = 0;
    this.useFallback = false;
  }
}

export const realtimeService = new RealtimeService();
