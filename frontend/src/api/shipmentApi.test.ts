import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shipmentApi } from './shipmentApi';

describe('shipmentApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('requests in-transit shipments with GPS from the shipments endpoint', async () => {
    const axiosGetSpy = vi.spyOn(axios, 'get').mockResolvedValue({
      data: {
        data: [],
        meta: { total: 0, page: 1, limit: 100 },
      },
    });

    await shipmentApi.getAllInTransitWithGps();

    expect(axiosGetSpy).toHaveBeenCalledWith(
      '/api/shipments',
      expect.objectContaining({
        params: expect.objectContaining({
          status: 'IN_TRANSIT',
          hasGPS: true,
        }),
      }),
    );
  });
});
