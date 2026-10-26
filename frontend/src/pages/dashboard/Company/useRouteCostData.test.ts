import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readRouteMetrics, useRouteCostData } from './useRouteCostData';

const { mockGetAll } = vi.hoisted(() => ({ mockGetAll: vi.fn() }));
vi.mock('@services/api/endpoints/shipments', () => ({ shipmentApi: { getAll: mockGetAll } }));

function shipment(id: string, origin: string, destination: string, offChainMetadata?: Record<string, unknown>) {
  return { id, _id: id, trackingNumber: `TRK-${id}`, origin, destination, offChainMetadata };
}

describe('readRouteMetrics', () => {
  it('returns null when the shipment recorded no cost or revenue figure', () => {
    expect(readRouteMetrics({})).toBeNull();
    expect(readRouteMetrics({ note: 'fragile', baseCost: '1200', revenue: null })).toBeNull();
    expect(readRouteMetrics({ baseCost: Number.NaN })).toBeNull();
  });

  it('keeps the recorded figures and counts an unrecorded one as 0', () => {
    expect(readRouteMetrics({ baseCost: 900, fuelCost: 300 })).toEqual({
      base: 900,
      fuel: 300,
      customs: 0,
      insurance: 0,
      revenue: 0,
    });
  });

  it('reads every figure when all are recorded', () => {
    expect(
      readRouteMetrics({ baseCost: 1, fuelCost: 2, customsCost: 3, insuranceCost: 4, revenue: 50 }),
    ).toEqual({ base: 1, fuel: 2, customs: 3, insurance: 4, revenue: 50 });
  });
});

describe('useRouteCostData', () => {
  beforeEach(() => {
    mockGetAll.mockReset();
  });

  it('returns no routes, with no invented costs, when shipments carry no cost metadata', async () => {
    mockGetAll.mockResolvedValue({
      data: [shipment('1', 'Lagos', 'Abuja'), shipment('2', 'Lagos', 'Abuja', { note: 'fragile' })],
    });

    const { result } = renderHook(() => useRouteCostData(0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.routeCostData).toEqual([]);
    expect(result.current.routeCostError).toBeNull();
  });

  it('returns no routes when the API returns no shipments', async () => {
    mockGetAll.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useRouteCostData(0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.routeCostData).toEqual([]);
  });

  it('aggregates only the shipments that recorded figures, per route', async () => {
    mockGetAll.mockResolvedValue({
      data: [
        shipment('1', 'Lagos', 'Abuja', { baseCost: 1000, fuelCost: 200, customsCost: 50, insuranceCost: 50, revenue: 2000 }),
        shipment('2', 'Lagos', 'Abuja', { baseCost: 500, revenue: 900 }),
        shipment('3', 'Lagos', 'Abuja'),
        shipment('4', 'Kano', 'Enugu'),
      ],
    });

    const { result } = renderHook(() => useRouteCostData(0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.routeCostData).toHaveLength(1);
    expect(result.current.routeCostData[0]).toMatchObject({
      route: 'Lagos → Abuja',
      base: 1500,
      fuel: 200,
      customs: 50,
      insurance: 50,
      revenue: 2900,
    });
    expect(result.current.routeCostData[0].shipments.map((s) => s.id)).toEqual(['1', '2']);
  });

  it('reports an error and no routes when the request fails', async () => {
    mockGetAll.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useRouteCostData(0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.routeCostError).toBe('Failed to load route cost data');
    expect(result.current.routeCostData).toEqual([]);
  });
});
