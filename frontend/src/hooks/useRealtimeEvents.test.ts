import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeEvents } from './useRealtimeEvents';

vi.mock('@services/realtime/realtimeService', () => ({
  realtimeService: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

import { realtimeService } from '@services/realtime/realtimeService';

const mockSubscribe = realtimeService.subscribe as ReturnType<typeof vi.fn>;
const mockUnsubscribe = realtimeService.unsubscribe as ReturnType<typeof vi.fn>;

describe('useRealtimeEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns an empty object before any event has fired', () => {
    const { result } = renderHook(() => useRealtimeEvents(['shipment:status']));

    expect(result.current).toEqual({});
  });

  it('subscribes to every requested event type on mount', () => {
    renderHook(() => useRealtimeEvents(['shipment:status', 'notification:new']));

    expect(mockSubscribe).toHaveBeenCalledTimes(2);
    expect(mockSubscribe).toHaveBeenCalledWith('shipment:status', expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalledWith('notification:new', expect.any(Function));
  });

  it('updates state with the latest event for a subscribed type', () => {
    const { result } = renderHook(() => useRealtimeEvents(['shipment:status']));
    const handler = mockSubscribe.mock.calls.find(([type]) => type === 'shipment:status')?.[1];

    const event = {
      type: 'shipment:status' as const,
      shipmentId: 'ship-1',
      newStatus: 'DELIVERED' as const,
      timestamp: '2026-01-01T00:00:00.000Z',
    };

    act(() => handler?.(event));

    expect(result.current['shipment:status']).toEqual(event);
  });

  it('overwrites the previous event of the same type with the newest one', () => {
    const { result } = renderHook(() => useRealtimeEvents(['shipment:status']));
    const handler = mockSubscribe.mock.calls.find(([type]) => type === 'shipment:status')?.[1];

    act(() =>
      handler?.({
        type: 'shipment:status',
        shipmentId: 'ship-1',
        newStatus: 'IN_TRANSIT',
        timestamp: 't1',
      }),
    );
    act(() =>
      handler?.({
        type: 'shipment:status',
        shipmentId: 'ship-1',
        newStatus: 'DELIVERED',
        timestamp: 't2',
      }),
    );

    expect(result.current['shipment:status']?.newStatus).toBe('DELIVERED');
    expect(result.current['shipment:status']?.timestamp).toBe('t2');
  });

  it('tracks the latest event independently per requested type', () => {
    const { result } = renderHook(() =>
      useRealtimeEvents(['shipment:status', 'notification:new']),
    );
    const statusHandler = mockSubscribe.mock.calls.find(([type]) => type === 'shipment:status')?.[1];
    const notificationHandler = mockSubscribe.mock.calls.find(
      ([type]) => type === 'notification:new',
    )?.[1];

    act(() =>
      statusHandler?.({
        type: 'shipment:status',
        shipmentId: 'ship-1',
        newStatus: 'DELIVERED',
        timestamp: 't1',
      }),
    );
    act(() =>
      notificationHandler?.({
        type: 'notification:new',
        notification: {
          id: 'n1',
          type: 'system',
          title: 'Hello',
          description: 'World',
          timestamp: 't1',
          isRead: false,
        },
      }),
    );

    expect(result.current['shipment:status']?.newStatus).toBe('DELIVERED');
    expect(result.current['notification:new']?.notification.id).toBe('n1');
  });

  it('unsubscribes every handler on unmount', () => {
    const { unmount } = renderHook(() =>
      useRealtimeEvents(['shipment:status', 'notification:new']),
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledWith('shipment:status', expect.any(Function));
    expect(mockUnsubscribe).toHaveBeenCalledWith('notification:new', expect.any(Function));
  });

  it('does not resubscribe when the hook re-renders with the same event types array reference change', () => {
    const { rerender } = renderHook(({ types }) => useRealtimeEvents(types), {
      initialProps: { types: ['shipment:status'] as const },
    });

    mockSubscribe.mockClear();
    rerender({ types: ['shipment:status'] as const });

    expect(mockSubscribe).not.toHaveBeenCalled();
  });
});
