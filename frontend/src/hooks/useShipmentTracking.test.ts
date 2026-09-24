import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mock realtimeService ─────────────────────────────────────────────────────

const { mockSubscribe, mockUnsubscribe } = vi.hoisted(() => ({
  mockSubscribe: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));

vi.mock('@services/realtime/realtimeService', () => ({
  realtimeService: {
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
  },
}));

import type { LocationUpdateEvent } from '../types/realtimeEvents';
import { useShipmentTracking } from './useShipmentTracking';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeLocationEvent(
  shipmentId: string,
  lat: number,
  lng: number,
  timestamp = '2024-01-01T00:00:00Z',
): LocationUpdateEvent {
  return { type: 'location:update', shipmentId, lat, lng, timestamp };
}

/** Returns the handler registered via realtimeService.subscribe */
function captureHandler(): (ev: LocationUpdateEvent) => void {
  const call = mockSubscribe.mock.calls.find(([event]) => event === 'location:update');
  if (!call) throw new Error('subscribe was not called with location:update');
  return call[1] as (ev: LocationUpdateEvent) => void;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useShipmentTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it('starts with null current, empty history, and null lastUpdated when no initial location', () => {
    const { result } = renderHook(() => useShipmentTracking('ship-1'));

    expect(result.current.current).toBeNull();
    expect(result.current.history).toHaveLength(0);
    expect(result.current.lastUpdated).toBeNull();
  });

  it('seeds current, history, and lastUpdated from initialLocation', () => {
    const initial = { lat: 51.5, lng: -0.1, timestamp: '2024-01-01T00:00:00Z' };
    const { result } = renderHook(() => useShipmentTracking('ship-1', initial));

    expect(result.current.current).toEqual(initial);
    expect(result.current.history).toEqual([initial]);
    expect(result.current.lastUpdated).toBe(initial.timestamp);
  });

  // ── Subscription lifecycle ─────────────────────────────────────────────────

  it('subscribes to location:update on mount', () => {
    renderHook(() => useShipmentTracking('ship-1'));
    expect(mockSubscribe).toHaveBeenCalledWith('location:update', expect.any(Function));
  });

  it('unsubscribes the same handler on unmount', () => {
    const { unmount } = renderHook(() => useShipmentTracking('ship-1'));
    const handler = captureHandler();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledWith('location:update', handler);
  });

  // ── Location updates ──────────────────────────────────────────────────────

  it('updates current and appends to history when a matching event arrives', () => {
    const { result } = renderHook(() => useShipmentTracking('ship-1'));
    const handler = captureHandler();

    const event = makeLocationEvent('ship-1', 48.85, 2.35, '2024-01-02T10:00:00Z');

    act(() => handler(event));

    expect(result.current.current).toEqual({ lat: 48.85, lng: 2.35, timestamp: '2024-01-02T10:00:00Z' });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.lastUpdated).toBe('2024-01-02T10:00:00Z');
  });

  it('accumulates history across multiple events', () => {
    const { result } = renderHook(() => useShipmentTracking('ship-1'));
    const handler = captureHandler();

    act(() => handler(makeLocationEvent('ship-1', 10, 20, '2024-01-01T01:00:00Z')));
    act(() => handler(makeLocationEvent('ship-1', 11, 21, '2024-01-01T02:00:00Z')));
    act(() => handler(makeLocationEvent('ship-1', 12, 22, '2024-01-01T03:00:00Z')));

    expect(result.current.history).toHaveLength(3);
    expect(result.current.current).toEqual({ lat: 12, lng: 22, timestamp: '2024-01-01T03:00:00Z' });
  });

  // ── Event filtering ───────────────────────────────────────────────────────

  it('ignores events for a different shipmentId', () => {
    const { result } = renderHook(() => useShipmentTracking('ship-1'));
    const handler = captureHandler();

    act(() => handler(makeLocationEvent('ship-DIFFERENT', 99, 99)));

    expect(result.current.current).toBeNull();
    expect(result.current.history).toHaveLength(0);
  });

  it('handles undefined shipmentId gracefully (no match, no crash)', () => {
    const { result } = renderHook(() => useShipmentTracking(undefined));
    const handler = captureHandler();

    act(() => handler(makeLocationEvent('ship-1', 1, 2)));

    expect(result.current.current).toBeNull();
  });

  // ── Dynamic shipmentId (ref-based) ────────────────────────────────────────

  it('picks up the latest shipmentId without re-subscribing', () => {
    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useShipmentTracking(id),
      { initialProps: { id: 'ship-A' } },
    );

    const subscribeCallsBefore = mockSubscribe.mock.calls.length;

    // Change the shipmentId
    rerender({ id: 'ship-B' });

    // No additional subscribe call — the ref update is internal
    expect(mockSubscribe.mock.calls.length).toBe(subscribeCallsBefore);

    const handler = captureHandler();

    // Event for old id should now be ignored
    act(() => handler(makeLocationEvent('ship-A', 1, 2)));
    expect(result.current.current).toBeNull();

    // Event for new id should be accepted
    act(() => handler(makeLocationEvent('ship-B', 5, 6, '2024-06-01T00:00:00Z')));
    expect(result.current.current).toEqual({ lat: 5, lng: 6, timestamp: '2024-06-01T00:00:00Z' });
  });

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  it('does not update state after unmount', () => {
    const { result, unmount } = renderHook(() => useShipmentTracking('ship-1'));
    const handler = captureHandler();

    unmount();

    // Dispatching after unmount should not throw or update stale state
    expect(() => act(() => handler(makeLocationEvent('ship-1', 1, 2)))).not.toThrow();
    expect(result.current.current).toBeNull();
  });
});
