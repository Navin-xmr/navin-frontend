import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { anomalyApi } from './anomalies';
import type { Anomaly } from './anomalies';

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

const mockAnomaly: Anomaly = {
  _id: 'anomaly-001',
  shipmentId: 'shipment-100',
  type: 'TEMPERATURE_EXCEEDED',
  severity: 'HIGH',
  message: 'Temperature reached 28°C',
  timestamp: '2026-07-28T04:00:00.000Z',
  resolved: false,
  createdAt: '2026-07-28T04:00:00.000Z',
  updatedAt: '2026-07-28T04:00:00.000Z',
};

const mockSecondAnomaly: Anomaly = {
  _id: 'anomaly-002',
  shipmentId: 'shipment-101',
  type: 'BATTERY_LOW',
  severity: 'MEDIUM',
  message: 'Tracker battery at 12%',
  timestamp: '2026-07-28T04:10:00.000Z',
  resolved: false,
  createdAt: '2026-07-28T04:10:00.000Z',
  updatedAt: '2026-07-28T04:10:00.000Z',
};

describe('anomalyApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('parses nested envelope response shape { data: { data: [...], meta: ... } }', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: [mockAnomaly, mockSecondAnomaly],
          meta: { nextCursor: 'cursor-123', hasMore: true },
        },
      });

      const result = await anomalyApi.getAll({ status: 'OPEN' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/anomalies', {
        params: { status: 'OPEN' },
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0]._id).toBe('anomaly-001');
      expect(result.meta.nextCursor).toBe('cursor-123');
      expect(result.meta.hasMore).toBe(true);
    });

    it('parses flat envelope response shape { data: [...], meta: ... }', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: [mockAnomaly],
        meta: { nextCursor: null, hasMore: false },
      });

      const result = await anomalyApi.getAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0]._id).toBe('anomaly-001');
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.hasMore).toBe(false);
    });

    it('parses raw array response shape [...anomalies]', async () => {
      mockApiClient.get.mockResolvedValueOnce([mockAnomaly, mockSecondAnomaly]);

      const result = await anomalyApi.getAll();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]._id).toBe('anomaly-001');
      expect(result.meta.hasMore).toBe(false);
    });

    it('handles null/undefined payload gracefully with empty data array', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: null });

      const result = await anomalyApi.getAll();

      expect(result.data).toEqual([]);
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.hasMore).toBe(false);
    });
  });

  describe('resolve', () => {
    it('extracts anomaly from nested envelope { data: Anomaly }', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { data: { ...mockAnomaly, resolved: true } },
      });

      const result = await anomalyApi.resolve('anomaly-001');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/anomalies/anomaly-001/resolve');
      expect(result._id).toBe('anomaly-001');
      expect(result.resolved).toBe(true);
    });

    it('extracts anomaly from raw response object', async () => {
      mockApiClient.patch.mockResolvedValueOnce({ ...mockAnomaly, resolved: true });

      const result = await anomalyApi.resolve('anomaly-001');

      expect(result._id).toBe('anomaly-001');
      expect(result.resolved).toBe(true);
    });
  });

  describe('acknowledge', () => {
    it('extracts anomaly from nested envelope { data: Anomaly }', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { data: mockAnomaly },
      });

      const result = await anomalyApi.acknowledge('anomaly-001');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/anomalies/anomaly-001/acknowledge');
      expect(result._id).toBe('anomaly-001');
    });
  });
});
