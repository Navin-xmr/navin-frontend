import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exceptionApi } from './exceptions';
import type { ShipmentException } from './exceptions';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from '../client';

const mockApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const mockException: ShipmentException = {
  id: 'exc-001',
  shipmentId: 'shipment-100',
  type: 'DELAYED',
  status: 'OPEN',
  ageHours: 12,
  owner: 'ops-team',
  route: 'Lagos → Accra',
  openedAt: '2026-09-20T08:00:00.000Z',
  resolutionHours: 0,
  severity: 'HIGH',
};

describe('exceptionApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('GETs /shipments/exceptions with the filter params and unwraps data', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: [mockException] } });
      const params = { type: 'DELAYED' as const, dateRange: '7d' as const, route: 'Lagos → Accra' };

      const result = await exceptionApi.getAll(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/shipments/exceptions', { params });
      expect(result).toEqual([mockException]);
    });

    it('passes undefined params when no filters are given', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: [] } });

      const result = await exceptionApi.getAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/shipments/exceptions', { params: undefined });
      expect(result).toEqual([]);
    });

    it('propagates request errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(exceptionApi.getAll()).rejects.toThrow('Network Error');
    });
  });

  describe('resolve', () => {
    it('PATCHes the resolve path with the note and unwraps data', async () => {
      const resolved = { ...mockException, status: 'RESOLVED' as const };
      mockApiClient.patch.mockResolvedValue({ data: { data: resolved } });

      const result = await exceptionApi.resolve('exc-001', 'Cleared customs');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/shipments/exceptions/exc-001/resolve', {
        note: 'Cleared customs',
      });
      expect(result).toEqual(resolved);
    });

    it('sends an undefined note when none is provided', async () => {
      mockApiClient.patch.mockResolvedValue({ data: { data: mockException } });

      await exceptionApi.resolve('exc-001');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/shipments/exceptions/exc-001/resolve', {
        note: undefined,
      });
    });

    it('propagates request errors', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Forbidden'));

      await expect(exceptionApi.resolve('exc-001')).rejects.toThrow('Forbidden');
    });
  });
});
