import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ledgerApi } from './ledger';
import type { PaginatedLedgerBlocks, LedgerBlock } from './ledger';

// ─── Mock axios client ────────────────────────────────────────────────────────

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from '../client';

const mockApiClient = apiClient as unknown as { get: ReturnType<typeof vi.fn> };

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockBlock: LedgerBlock = {
  blockNumber: 50_000_001,
  timestamp: '2024-03-15T10:30:00.000Z',
  shipmentId: 'ship-001',
  shipmentReference: 'NAV-2024-001',
  milestoneEvent: 'DELIVERED',
  transactionHash: 'a'.repeat(64),
  ledger: 50_000_001,
  verified: true,
};

const mockSecondBlock: LedgerBlock = {
  blockNumber: 50_000_002,
  timestamp: '2024-03-15T11:00:00.000Z',
  shipmentId: 'ship-002',
  shipmentReference: 'NAV-2024-002',
  milestoneEvent: 'IN_TRANSIT',
  transactionHash: 'b'.repeat(64),
  ledger: 50_000_002,
  verified: false,
};

const mockPaginatedResponse: PaginatedLedgerBlocks = {
  data: [mockBlock, mockSecondBlock],
  nextCursor: 'cursor-abc-123',
  hasMore: true,
  total: 250,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ledgerApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBlocks', () => {
    it('calls GET /ledger/blocks without params', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

      const result = await ledgerApi.getBlocks();

      expect(mockApiClient.get).toHaveBeenCalledOnce();
      expect(mockApiClient.get).toHaveBeenCalledWith('/ledger/blocks', { params: undefined });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('returns paginated blocks with correct shape', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

      const result = await ledgerApi.getBlocks();

      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor-abc-123');
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(250);
    });

    it('passes cursor param when provided', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

      await ledgerApi.getBlocks({ cursor: 'cursor-abc-123' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/ledger/blocks', {
        params: { cursor: 'cursor-abc-123' },
      });
    });

    it('passes limit param when provided', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

      await ledgerApi.getBlocks({ limit: 25 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/ledger/blocks', {
        params: { limit: 25 },
      });
    });

    it('passes milestoneEvent filter when provided', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

      await ledgerApi.getBlocks({ milestoneEvent: 'DELIVERED' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/ledger/blocks', {
        params: { milestoneEvent: 'DELIVERED' },
      });
    });

    it('passes combined params correctly', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

      await ledgerApi.getBlocks({
        cursor: 'cursor-xyz',
        limit: 10,
        milestoneEvent: 'IN_TRANSIT',
        shipmentId: 'ship-001',
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/ledger/blocks', {
        params: {
          cursor: 'cursor-xyz',
          limit: 10,
          milestoneEvent: 'IN_TRANSIT',
          shipmentId: 'ship-001',
        },
      });
    });

    it('returns empty data when no blocks exist', async () => {
      const emptyResponse: PaginatedLedgerBlocks = {
        data: [],
        nextCursor: null,
        hasMore: false,
        total: 0,
      };
      mockApiClient.get.mockResolvedValueOnce({ data: emptyResponse });

      const result = await ledgerApi.getBlocks();

      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('propagates network errors', async () => {
      const networkError = new Error('Network Error');
      mockApiClient.get.mockRejectedValueOnce(networkError);

      await expect(ledgerApi.getBlocks()).rejects.toThrow('Network Error');
    });

    it('propagates 401 errors', async () => {
      const authError = Object.assign(new Error('Unauthorized'), { response: { status: 401 } });
      mockApiClient.get.mockRejectedValueOnce(authError);

      await expect(ledgerApi.getBlocks()).rejects.toThrow('Unauthorized');
    });

    it('block data matches LedgerBlock interface shape', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

      const result = await ledgerApi.getBlocks();
      const block = result.data[0];

      expect(typeof block.blockNumber).toBe('number');
      expect(typeof block.timestamp).toBe('string');
      expect(typeof block.shipmentId).toBe('string');
      expect(typeof block.shipmentReference).toBe('string');
      expect(typeof block.milestoneEvent).toBe('string');
      expect(typeof block.transactionHash).toBe('string');
      expect(typeof block.ledger).toBe('number');
      expect(typeof block.verified).toBe('boolean');
    });
  });
});
