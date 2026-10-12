import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useShipmentDetail } from './useShipmentDetail';
import type { Shipment } from '@services/api/endpoints/shipments';

vi.mock('@services/api/endpoints/shipments', () => ({
  shipmentApi: {
    getById: vi.fn(),
  },
}));

vi.mock('@services/realtime/realtimeService', () => ({
  realtimeService: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

import { shipmentApi } from '@services/api/endpoints/shipments';
import { realtimeService } from '@services/realtime/realtimeService';

const mockGetById = shipmentApi.getById as ReturnType<typeof vi.fn>;
const mockSubscribe = realtimeService.subscribe as ReturnType<typeof vi.fn>;
const mockUnsubscribe = realtimeService.unsubscribe as ReturnType<typeof vi.fn>;

const mockShipment: Shipment = {
  _id: 'ship-001',
  trackingNumber: 'NAV-2024-001',
  origin: 'New York, NY',
  destination: 'Boston, MA',
  enterpriseId: 'ent-1',
  logisticsId: 'log-1',
  status: 'IN_TRANSIT',
  milestones: [],
  createdAt: '2024-03-15T10:30:00.000Z',
  updatedAt: '2024-03-15T10:30:00.000Z',
};

describe('useShipmentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns isLoading: true while the API call is pending', async () => {
    let resolveFn: (value: Shipment) => void = () => {};
    mockGetById.mockReturnValueOnce(new Promise((resolve) => { resolveFn = resolve; }));

    const { result } = renderHook(() => useShipmentDetail('ship-001'));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveFn(mockShipment);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('sets shipment on successful API response', async () => {
    mockGetById.mockResolvedValueOnce(mockShipment);

    const { result } = renderHook(() => useShipmentDetail('ship-001'));

    await waitFor(() => expect(result.current.shipment).toEqual(mockShipment));
    expect(result.current.error).toBeNull();
  });

  it('sets error when the API rejects', async () => {
    mockGetById.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useShipmentDetail('ship-001'));

    await waitFor(() => expect(result.current.error).toBe('Network Error'));
    expect(result.current.shipment).toBeNull();
  });

  it('receiving a matching shipment:status event triggers a re-fetch', async () => {
    mockGetById.mockResolvedValue(mockShipment);

    const { result } = renderHook(() => useShipmentDetail('ship-001'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetById).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith('shipment:status', expect.any(Function));

    const statusHandler = mockSubscribe.mock.calls.find(([type]) => type === 'shipment:status')?.[1];

    await act(async () => {
      statusHandler?.({ type: 'shipment:status', shipmentId: 'ship-001', newStatus: 'DELIVERED', timestamp: 'now' });
    });

    await waitFor(() => expect(mockGetById).toHaveBeenCalledTimes(2));
  });

  it('refresh() re-calls shipmentApi.getById', async () => {
    mockGetById.mockResolvedValue(mockShipment);

    const { result } = renderHook(() => useShipmentDetail('ship-001'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetById).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(mockGetById).toHaveBeenCalledTimes(2));
  });

  it('unsubscribes from realtime events on unmount', async () => {
    mockGetById.mockResolvedValue(mockShipment);

    const { result, unmount } = renderHook(() => useShipmentDetail('ship-001'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledWith('shipment:status', expect.any(Function));
    expect(mockUnsubscribe).toHaveBeenCalledWith('shipment:milestone', expect.any(Function));
  });

  describe('periodic refresh of contract state', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    async function flushInitialLoad() {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
    }

    async function advance(ms: number) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
      });
    }

    it('re-fetches every 30 seconds so a completed settlement shows up without a reload', async () => {
      vi.useFakeTimers();
      mockGetById
        .mockResolvedValueOnce({ ...mockShipment, status: 'IN_TRANSIT' })
        .mockResolvedValue({ ...mockShipment, status: 'DELIVERED' });

      const { result } = renderHook(() => useShipmentDetail('ship-001'));
      await flushInitialLoad();
      expect(result.current.shipment?.status).toBe('IN_TRANSIT');
      expect(mockGetById).toHaveBeenCalledTimes(1);

      await advance(29_000);
      expect(mockGetById).toHaveBeenCalledTimes(1);

      await advance(1_000);
      expect(mockGetById).toHaveBeenCalledTimes(2);
      expect(result.current.shipment?.status).toBe('DELIVERED');
    });

    it('polls in the background without flipping back to the loading state', async () => {
      vi.useFakeTimers();
      mockGetById.mockResolvedValue(mockShipment);

      const { result } = renderHook(() => useShipmentDetail('ship-001'));
      await flushInitialLoad();
      expect(result.current.isLoading).toBe(false);

      let resolveNext: (value: Shipment) => void = () => {};
      mockGetById.mockReturnValueOnce(new Promise<Shipment>((resolve) => { resolveNext = resolve; }));
      await advance(30_000);

      expect(result.current.isLoading).toBe(false);
      await act(async () => { resolveNext(mockShipment); });
    });

    it('records when the state was last fetched', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-30T10:00:00.000Z'));
      mockGetById.mockResolvedValue(mockShipment);

      const { result } = renderHook(() => useShipmentDetail('ship-001'));
      expect(result.current.lastUpdatedAt).toBeNull();
      await flushInitialLoad();

      expect(result.current.lastUpdatedAt).toBeGreaterThanOrEqual(new Date('2026-09-30T10:00:00.000Z').getTime());
      expect(result.current.lastUpdatedAt).toBeLessThanOrEqual(new Date('2026-09-30T10:00:00.010Z').getTime());
      expect(result.current.isStale).toBe(false);
    });

    it('flags the data as stale after 5 minutes of failed refreshes and recovers on success', async () => {
      vi.useFakeTimers();
      mockGetById.mockResolvedValueOnce(mockShipment).mockRejectedValue(new Error('RPC down'));

      const { result } = renderHook(() => useShipmentDetail('ship-001'));
      await flushInitialLoad();
      expect(result.current.isStale).toBe(false);

      // Nine failed polls (4.5 minutes): the last good data stays, not stale yet.
      await advance(9 * 30_000);
      expect(result.current.shipment).toEqual(mockShipment);
      expect(result.current.error).toBeNull();
      expect(result.current.isStale).toBe(false);

      // Past the 5 minute mark it is flagged.
      await advance(2 * 30_000);
      expect(result.current.isStale).toBe(true);

      // A successful refresh clears it.
      mockGetById.mockResolvedValue({ ...mockShipment, status: 'DELIVERED' });
      await act(async () => { result.current.refresh(); });
      expect(result.current.isStale).toBe(false);
      expect(result.current.shipment?.status).toBe('DELIVERED');
    });

    it('stops polling when unmounted', async () => {
      vi.useFakeTimers();
      mockGetById.mockResolvedValue(mockShipment);

      const { unmount } = renderHook(() => useShipmentDetail('ship-001'));
      await flushInitialLoad();
      unmount();

      await advance(120_000);
      expect(mockGetById).toHaveBeenCalledTimes(1);
    });
  });
});
