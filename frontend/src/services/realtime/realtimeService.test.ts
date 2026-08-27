import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealtimeService } from './realtimeService';
import { apiClient } from '../api/client';
import type { RealtimeEvent } from '../../types/realtimeEvents';

vi.mock('../api/client', () => ({
  apiClient: { get: vi.fn() },
}));

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
    vi.mocked(apiClient.get).mockReset().mockResolvedValue({ data: [] });
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

  it('onStatusChange unsubscribe stops future notifications', () => {
    const listener = vi.fn();
    const unsubscribe = service.onStatusChange(listener);
    unsubscribe();

    service.connect();
    MockEventSource.instance!.simulateOpen();

    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores malformed JSON messages instead of throwing', () => {
    const handler = vi.fn();
    service.subscribe('shipment:status', handler);
    service.connect();
    MockEventSource.instance!.simulateOpen();

    expect(() => MockEventSource.instance!.simulateMessage('{not valid json')).not.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple subscribers for the same event type', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    service.subscribe('shipment:status', handlerA);
    service.subscribe('shipment:status', handlerB);
    service.connect();
    MockEventSource.instance!.simulateOpen();

    const event: RealtimeEvent = {
      type: 'shipment:status',
      shipmentId: 'abc',
      newStatus: 'DELIVERED',
      timestamp: '',
    };
    MockEventSource.instance!.simulateMessage(JSON.stringify(event));

    expect(handlerA).toHaveBeenCalledWith(event);
    expect(handlerB).toHaveBeenCalledWith(event);
  });

  it('unsubscribing one handler does not affect another handler for the same type', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    service.subscribe('shipment:status', handlerA);
    service.subscribe('shipment:status', handlerB);
    service.unsubscribe('shipment:status', handlerA);
    service.connect();
    MockEventSource.instance!.simulateOpen();

    MockEventSource.instance!.simulateMessage(
      JSON.stringify({ type: 'shipment:status', shipmentId: 'abc', newStatus: 'DELIVERED', timestamp: '' }),
    );

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).toHaveBeenCalled();
  });

  it('falls back to polling immediately when EventSource is unavailable', () => {
    vi.unstubAllGlobals();
    vi.useFakeTimers();

    service.connect();

    expect(service.status).toBe('disconnected');
    expect(MockEventSource.instance).toBeNull();
  });

  it('poll() emits fetched events to subscribers and sets status to connected', async () => {
    vi.useFakeTimers();
    const event: RealtimeEvent = {
      type: 'notification:new',
      notification: {
        id: 'n1',
        type: 'system',
        title: 'Hello',
        description: 'World',
        timestamp: 'now',
        isRead: false,
      },
    };
    vi.unstubAllGlobals();
    vi.mocked(apiClient.get).mockResolvedValue({ data: [event] });
    const handler = vi.fn();
    service.subscribe('notification:new', handler);

    service.connect();

    await vi.advanceTimersByTimeAsync(15_000);

    expect(apiClient.get).toHaveBeenCalledWith('/api/events/poll');
    expect(handler).toHaveBeenCalledWith(event);
    expect(service.status).toBe('connected');
  });

  it('poll() sets status to disconnected when the request fails', async () => {
    vi.useFakeTimers();
    vi.unstubAllGlobals();
    vi.mocked(apiClient.get).mockRejectedValue(new Error('network down'));

    service.connect();

    await vi.advanceTimersByTimeAsync(15_000);

    expect(service.status).toBe('disconnected');
  });

  it('reset() allows a new SSE connection after a prior disconnect', () => {
    service.connect();
    service.disconnect();
    expect(MockEventSource.instance!.closed).toBe(true);

    service.reset();
    service.connect();

    expect(MockEventSource.instance).not.toBeNull();
    expect(MockEventSource.instance!.closed).toBe(false);
  });

  it('connect() is a no-op once the service has been closed without a reset', () => {
    service.connect();
    service.disconnect();
    MockEventSource.instance = null;

    service.connect();

    expect(MockEventSource.instance).toBeNull();
  });
});

function backoffMs(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30_000);
}
