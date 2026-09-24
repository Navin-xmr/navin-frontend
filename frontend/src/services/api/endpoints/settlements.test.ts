import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settlementsApi } from './settlements';
import type {
  PaginatedSettlements,
  RevenueSummaryResponse,
  Settlement,
  SettlementDetail,
} from './settlements';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from '../client';

const mockApiClient = apiClient as unknown as { get: ReturnType<typeof vi.fn> };

// === Fixtures

const mockSettlement: Settlement = {
  _id: 'settlement-001',
  createdAt: '2026-07-01T10:00:00.000Z',
  shipmentId: 'shipment-100',
  payerAddress: 'GABC...PAYER',
  payeeAddress: 'GXYZ...PAYEE',
  amount: 2500,
  token: 'USDC',
  status: 'ESCROWED',
  stellarTxHash: 'b'.repeat(64),
};

const mockSecondSettlement: Settlement = {
  _id: 'settlement-002',
  createdAt: '2026-07-02T10:00:00.000Z',
  shipmentId: 'shipment-101',
  amount: 900,
  token: 'USDC',
  status: 'RELEASED',
};

const mockPaginated: PaginatedSettlements = {
  data: [mockSettlement, mockSecondSettlement],
  page: 1,
  limit: 20,
  total: 2,
};

const mockSummary: RevenueSummaryResponse = {
  totalReleased: 12_000,
  totalInEscrow: 4_500,
  totalPending: 1_200,
  sparkline: [100, 200, 300],
};

const mockDetail: SettlementDetail = {
  settlement: {
    ...mockSettlement,
    escrowRelease: {
      conditionDescription: 'Release on delivery confirmation',
      releasedAt: '2026-07-03T10:00:00.000Z',
      releasedBy: 'user-001',
    },
  },
  summary: {
    totalSettledAmount: 12_000,
    pendingCount: 3,
    disputedCount: 1,
  },
};

describe('settlementsApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSummary', () => {
    it('defaults the period to month and unwraps the envelope', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockSummary } });

      const result = await settlementsApi.getSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith('/settlements/summary', {
        params: { period: 'month' },
      });
      expect(result).toEqual(mockSummary);
    });

    it('forwards an explicit period', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockSummary } });

      await settlementsApi.getSummary('quarter');

      expect(mockApiClient.get).toHaveBeenCalledWith('/settlements/summary', {
        params: { period: 'quarter' },
      });
    });

    it('propagates a rejected request', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Summary unavailable'));

      await expect(settlementsApi.getSummary('week')).rejects.toThrow('Summary unavailable');
    });
  });

  describe('getSettlements', () => {
    it('returns the paginated payload from the envelope', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockPaginated } });

      const result = await settlementsApi.getSettlements({ page: 1, limit: 20, status: 'ALL' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/settlements', {
        params: { page: 1, limit: 20, status: 'ALL' },
      });
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('passes undefined params through when called with no arguments', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockPaginated } });

      await settlementsApi.getSettlements();

      expect(mockApiClient.get).toHaveBeenCalledWith('/settlements', { params: undefined });
    });

    it('propagates a rejected request', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Request failed'));

      await expect(settlementsApi.getSettlements()).rejects.toThrow('Request failed');
    });
  });

  describe('getSettlementById', () => {
    it('requests the settlement by id and unwraps the detail payload', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockDetail } });

      const result = await settlementsApi.getSettlementById('settlement-001');

      expect(mockApiClient.get).toHaveBeenCalledWith('/settlements/settlement-001');
      expect(result.settlement._id).toBe('settlement-001');
      expect(result.settlement.escrowRelease?.releasedBy).toBe('user-001');
      expect(result.summary?.disputedCount).toBe(1);
    });

    it('propagates a rejected request for an unknown id', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(settlementsApi.getSettlementById('missing')).rejects.toThrow('Not found');
    });
  });

  describe('getByShipmentId', () => {
    it('filters by shipmentId and returns the inner settlements array', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockPaginated } });

      const result = await settlementsApi.getByShipmentId('shipment-100');

      expect(mockApiClient.get).toHaveBeenCalledWith('/settlements', {
        params: { shipmentId: 'shipment-100' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe('settlement-001');
    });

    it('returns an empty array when the shipment has no settlements', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { data: { data: [], page: 1, limit: 20, total: 0 } },
      });

      const result = await settlementsApi.getByShipmentId('shipment-999');

      expect(result).toEqual([]);
    });

    it('propagates a rejected request', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Request failed'));

      await expect(settlementsApi.getByShipmentId('shipment-100')).rejects.toThrow(
        'Request failed'
      );
    });
  });
});
