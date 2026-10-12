import type { RealtimeEvent, RealtimeEventType } from '../../types/realtimeEvents';
import { apiClient } from '../api/client';
import { getToken } from '../auth/tokenStorage';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected' | 'offline';

type Handler<T extends RealtimeEvent = RealtimeEvent> = (event: T) => void;

/**
 * Real-time is on by default and uses the API base URL. Deployments without
 * an event stream (e.g. a sandbox) set VITE_DISABLE_REALTIME=true; the service
 * then reports 'offline' so the UI can offer manual refresh instead.
 *
 * Read inside the function (not at module scope) so vi.stubEnv() works in tests.
 */
function isRealtimeDisabled(): boolean {
  return import.meta.env.VITE_DISABLE_REALTIME === 'true';
}

/**
 * Build the SSE endpoint URL from VITE_API_BASE_URL so it works in production
 * (no Vite proxy). We append the token as a query param because the browser's
 * EventSource API cannot set Authorization headers.
 *
 * Reading the env var inside the function (not at module scope) allows
 * vi.stubEnv() to work correctly in tests.
 */
function buildSseUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  const token = getToken();
  const url = `${base}/events`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

/**
 * Event names the backend puts on the SSE stream (`event: <type>`). Named
 * events never reach `onmessage`, so each one needs its own listener.
 */
const SSE_EVENT_TYPES: readonly RealtimeEventType[] = [
  'shipment:status',
  'shipment:milestone',
  'settlement:status',
  'notification:new',
  'anomaly:detected',
  'location:update',
];

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
  /** When the last successful poll was requested; sent as `since` on the next one. */
  private lastPollAt: string | null = null;

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

    if (isRealtimeDisabled()) {
      this.setStatus('offline');
      return;
    }

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
    const es = new EventSource(buildSseUrl(), { withCredentials: true });
    this.eventSource = es;

    es.onopen = () => {
      this.retryCount = 0;
      this.setStatus('connected');
    };

    const handleMessage = (e: MessageEvent) => {
      this.dispatch(e.data as string);
    };
    es.onmessage = handleMessage;
    SSE_EVENT_TYPES.forEach((type) => es.addEventListener(type, handleMessage));

    es.onerror = () => {
      es.close();
      this.eventSource = null;
      this.setStatus('reconnecting');

      if (this.closed) return;

      if (this.retryCount >= MAX_RETRIES) {
        console.warn(
          '[realtime] Failed to connect to real-time endpoint; falling back to polling. Real-time is optional.',
        );
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
      const requestedAt = new Date().toISOString();
      // Without `since` the API returns its default recent window.
      const res = await apiClient.get<{ data: RealtimeEvent[] }>('/events/poll', {
        params: this.lastPollAt ? { since: this.lastPollAt } : undefined,
      });
      this.lastPollAt = requestedAt;
      (res.data.data ?? []).forEach((ev) => this.emit(ev));
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
    this.lastPollAt = null;
  }
}

export const realtimeService = new RealtimeService();
