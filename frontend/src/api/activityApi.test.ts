import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activityApi } from './activityApi';

describe('activityApi.getActivity', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-24T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('requests /api/activity with no params by default', async () => {
    const getSpy = vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } });

    const result = await activityApi.getActivity();

    expect(getSpy).toHaveBeenCalledWith('/api/activity', { params: {} });
    expect(result).toEqual({ data: [], meta: {} });
  });

  it('forwards limit and before cursor for pagination', async () => {
    const meta = { limit: 20, total: 45, before: 'cursor-2' };
    const getSpy = vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: [], meta } });

    const result = await activityApi.getActivity({ limit: 20, before: 'cursor-1' });

    expect(getSpy).toHaveBeenCalledWith('/api/activity', {
      params: { limit: '20', before: 'cursor-1' },
    });
    expect(result.meta).toEqual(meta);
  });

  it('omits an empty before cursor', async () => {
    const getSpy = vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } });

    await activityApi.getActivity({ limit: 5, before: '' });

    expect(getSpy).toHaveBeenCalledWith('/api/activity', { params: { limit: '5' } });
  });

  it('normalises id, createdAt and shipmentId from alternate backend fields', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: {
        data: [
          { id: 'evt-1', type: 'SHIPMENT_CREATED', createdAt: '2026-09-23T10:00:00.000Z', shipmentId: 'shp-1' },
          { _id: 'evt-2', timestamp: '2026-09-23T09:00:00.000Z', shipment: { id: 'shp-2', trackingNumber: 'TRK-2' } },
          { eventId: 'evt-3', time: '2026-09-23T08:00:00.000Z' },
          { message: 'no id or time' },
        ],
      },
    });

    const { data } = await activityApi.getActivity();

    expect(data.map((e) => e.id)).toEqual(['evt-1', 'evt-2', 'evt-3', '3']);
    expect(data.map((e) => e.createdAt)).toEqual([
      '2026-09-23T10:00:00.000Z',
      '2026-09-23T09:00:00.000Z',
      '2026-09-23T08:00:00.000Z',
      '2026-09-24T12:00:00.000Z',
    ]);
    expect(data[0].shipmentId).toBe('shp-1');
    expect(data[1].shipmentId).toBe('shp-2');
    expect(data[1].shipment).toEqual({ id: 'shp-2', trackingNumber: 'TRK-2' });
  });

  it('returns an empty feed when the payload has no data array', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: null });

    await expect(activityApi.getActivity()).resolves.toEqual({ data: [], meta: {} });
  });

  it('propagates request errors', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Request failed with status code 500'));

    await expect(activityApi.getActivity()).rejects.toThrow('Request failed with status code 500');
  });
});
