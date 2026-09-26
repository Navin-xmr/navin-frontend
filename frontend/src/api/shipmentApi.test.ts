import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shipmentApi } from './shipmentApi';

vi.mock('../services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from '../services/api/client';

const mockApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

describe('shipmentApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockApiClient.get.mockResolvedValue({
      data: {
        data: [],
        meta: { total: 0, page: 1, limit: 100 },
      },
    });
  });

  it('requests in-transit shipments with GPS from the shipments endpoint', async () => {
    await shipmentApi.getAllInTransitWithGps();

    expect(mockApiClient.get).toHaveBeenCalledWith(
      '/shipments',
      expect.objectContaining({
        params: expect.objectContaining({
          status: 'IN_TRANSIT',
          hasGPS: true,
        }),
      }),
    );
  });

  it('does not include the /api prefix in the URL (baseURL already contains it)', async () => {
    await shipmentApi.getAll();

    expect(mockApiClient.get).toHaveBeenCalledWith(
      '/shipments',
      expect.anything(),
    );
    // Ensure the old bare-axios path is never used
    const calledUrl: string = mockApiClient.get.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('/api/');
  });
});
