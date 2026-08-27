import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyticsApi } from './analytics';
import type { AnalyticsPerformance, AnalyticsSummary } from './analytics';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from '../client';

const mockApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
};

describe('analyticsApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPerformance', () => {
    it('requests the date range and returns the unwrapped payload', async () => {
      const mockPerformance: AnalyticsPerformance = {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        shipmentsByStatus: [{ status: 'DELIVERED', total: 12 }],
        averageDeliveryTimeByLogisticsId: [{ logisticsId: 'log-1', averageDeliveryTimeMs: 3600000 }],
        totalDelayedShipments: 2,
      };
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockPerformance } });

      const result = await analyticsApi.getPerformance('2026-01-01', '2026-01-31');

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/performance', {
        params: { startDate: '2026-01-01', endDate: '2026-01-31' },
      });
      expect(result).toEqual(mockPerformance);
    });

    it('propagates rejection from the client', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('network error'));

      await expect(analyticsApi.getPerformance('2026-01-01', '2026-01-31')).rejects.toThrow('network error');
    });
  });

  describe('getSummary', () => {
    it('requests the summary endpoint and returns the unwrapped payload', async () => {
      const mockSummary: AnalyticsSummary = {
        onTimeDeliveryRate: 0.95,
        onTimeDeliveryRatePrev: 0.9,
        onTimeDeliverySparkline: [1, 2, 3],
        averageTransitDays: 3.2,
        averageTransitDaysPrev: 3.5,
        averageTransitDaysSparkline: [3, 4, 3],
        totalShipmentsThisMonth: 100,
        totalShipmentsThisMonthPrev: 90,
        totalShipmentsSparkline: [90, 95, 100],
        disputeRate: 0.02,
        disputeRatePrev: 0.03,
        disputeRateSparkline: [3, 2, 2],
      };
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockSummary } });

      const result = await analyticsApi.getSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/summary');
      expect(result).toEqual(mockSummary);
    });

    it('propagates rejection from the client', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('server error'));

      await expect(analyticsApi.getSummary()).rejects.toThrow('server error');
    });
  });
});
