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
});
