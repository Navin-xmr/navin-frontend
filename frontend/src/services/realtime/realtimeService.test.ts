import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealtimeService } from './realtimeService';
import type { RealtimeEvent } from '../../types/realtimeEvents';

// Minimal EventSource mock
class MockEventSource {
  static instance: MockEventSource | null = null;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor() {
    MockEventSource.instance = this;
  }

  close() {
    this.closed = true;
  }

  simulateOpen() {
    this.onopen?.();
  }

  simulateMessage(data: string) {
    this.onmessage?.({ data });
  }

  simulateError() {
    this.onerror?.();
  }
}

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(() => {
    MockEventSource.instance = null;
    vi.stubGlobal('EventSource', MockEventSource);
    service = new RealtimeService();
  });

  afterEach(() => {
    service.disconnect();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('opens an EventSource on connect()', () => {
    service.connect();
    expect(MockEventSource.instance).not.toBeNull();
  });

  it('sets status to connected on open', () => {
    service.connect();
    MockEventSource.instance!.simulateOpen();
    expect(service.status).toBe('connected');
  });

  it('subscribe receives dispatched events', () => {
    const handler = vi.fn();
    service.subscribe('shipment:status', handler);
    service.connect();
    MockEventSource.instance!.simulateOpen();

    const event: RealtimeEvent = {
      type: 'shipment:status',
      shipmentId: 'abc',
      newStatus: 'DELIVERED',
      timestamp: new Date().toISOString(),
    };
    MockEventSource.instance!.simulateMessage(JSON.stringify(event));
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('unsubscribe stops receiving events', () => {
    const handler = vi.fn();
    service.subscribe('shipment:status', handler);
    service.unsubscribe('shipment:status', handler);
    service.connect();
    MockEventSource.instance!.simulateOpen();

    MockEventSource.instance!.simulateMessage(
      JSON.stringify({ type: 'shipment:status', shipmentId: 'x', newStatus: 'IN_TRANSIT', timestamp: '' }),
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call handler for wrong event type', () => {
    const handler = vi.fn();
    service.subscribe('notification:new', handler);
    service.connect();
    MockEventSource.instance!.simulateOpen();

    MockEventSource.instance!.simulateMessage(
      JSON.stringify({ type: 'shipment:status', shipmentId: 'x', newStatus: 'IN_TRANSIT', timestamp: '' }),
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('retries with exponential backoff on error', () => {
    vi.useFakeTimers();
    service.connect();
    const es1 = MockEventSource.instance!;
    es1.simulateError();
    expect(service.status).toBe('reconnecting');

    vi.advanceTimersByTime(1000);
    const es2 = MockEventSource.instance!;
    expect(es2).not.toBe(es1);
  });

  it('falls back to polling after MAX_RETRIES errors', () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    service.connect();
    // Exhaust all 3 retries + trigger the 4th error that switches to fallback
    for (let i = 0; i <= 3; i++) {
      MockEventSource.instance!.simulateError();
      vi.advanceTimersByTime(backoffMs(i));
    }
    // After exhausting retries, fallback polling starts and status is disconnected
    expect(service.status).toBe('disconnected');
  });

  it('disconnect closes the EventSource and clears timers', () => {
    service.connect();
    const es = MockEventSource.instance!;
    service.disconnect();
    expect(es.closed).toBe(true);
    expect(service.status).toBe('disconnected');
  });

  it('onStatusChange is called when status changes', () => {
    const listener = vi.fn();
    service.onStatusChange(listener);
    service.connect();
    MockEventSource.instance!.simulateOpen();
    expect(listener).toHaveBeenCalledWith('reconnecting');
    expect(listener).toHaveBeenCalledWith('connected');
  });
});

function backoffMs(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30_000);
}
