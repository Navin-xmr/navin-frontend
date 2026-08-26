import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useLedger } from './useLedger';
import type { PaginatedLedgerBlocks } from '@services/api/endpoints/ledger';

// ─── Mock ledgerApi ───────────────────────────────────────────────────────────

vi.mock('@services/api/endpoints/ledger', () => ({
  ledgerApi: {
    getBlocks: vi.fn(),
  },
}));

import { ledgerApi } from '@services/api/endpoints/ledger';

const mockGetBlocks = ledgerApi.getBlocks as ReturnType<typeof vi.fn>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeBlock = (n: number) => ({
  blockNumber: 50_000_000 + n,
  timestamp: `2024-03-15T${String(10 + n).padStart(2, '0')}:00:00.000Z`,
  shipmentId: `ship-${n}`,
  shipmentReference: `NAV-2024-00${n}`,
  milestoneEvent: 'DELIVERED' as const,
  transactionHash: `${'a'.repeat(60)}000${n}`,
  ledger: 50_000_000 + n,
  verified: true,
});

const singlePageResponse: PaginatedLedgerBlocks = {
  data: [makeBlock(1), makeBlock(2)],
  nextCursor: null,
  hasMore: false,
  total: 2,
};

const multiPageResponse: PaginatedLedgerBlocks = {
  data: [makeBlock(1), makeBlock(2)],
  nextCursor: 'cursor-page-2',
  hasMore: true,
  total: 4,
};

const emptyResponse: PaginatedLedgerBlocks = {
  data: [],
  nextCursor: null,
  hasMore: false,
  total: 0,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useLedger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial loading state ─────────────────────────────────────────────────

  describe('loading state', () => {
    it('starts in loading state', () => {
      mockGetBlocks.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useLedger());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.entries).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('sets isLoading to false after fetch resolves', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // ── Successful fetch ──────────────────────────────────────────────────────

  describe('successful fetch', () => {
    it('populates entries from API response', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.entries).toHaveLength(2);
      });

      expect(result.current.entries[0].shipmentReference).toBe('NAV-2024-001');
      expect(result.current.entries[1].shipmentReference).toBe('NAV-2024-002');
    });

    it('sets total from API response', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.total).toBe(2);
      });
    });

    it('sets hasMore correctly when there are more pages', async () => {
      mockGetBlocks.mockResolvedValue(multiPageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.hasMore).toBe(true);
      });
    });

    it('sets hasMore to false on last page', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.hasMore).toBe(false);
      });
    });

    it('sets nextCursor when available', async () => {
      mockGetBlocks.mockResolvedValue(multiPageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.nextCursor).toBe('cursor-page-2');
      });
    });

    it('sets nextCursor to null on last page', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.nextCursor).toBeNull();
      });
    });

    it('returns empty entries when API returns no blocks', async () => {
      mockGetBlocks.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.entries).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });

    it('does not set total when API omits total field', async () => {
      const responseWithoutTotal: PaginatedLedgerBlocks = {
        data: [makeBlock(1)],
        nextCursor: null,
        hasMore: false,
        // total intentionally omitted
      };
      mockGetBlocks.mockResolvedValue(responseWithoutTotal);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.total).toBeUndefined();
    });
  });

  // ── Error state ───────────────────────────────────────────────────────────

  describe('error state', () => {
    it('sets error message when API throws an Error', async () => {
      mockGetBlocks.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.error).toBe('Network Error');
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.entries).toHaveLength(0);
    });

    it('sets fallback error message when thrown value is not an Error', async () => {
      mockGetBlocks.mockRejectedValue('unexpected string error');

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Failed to load blockchain ledger data. Please try again.',
        );
      });
    });

    it('clears error on successful refetch', async () => {
      mockGetBlocks
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce(singlePageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.error).toBe('Network Error');
      });

      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.entries).toHaveLength(2);
      });
    });
  });

  // ── Params forwarding ─────────────────────────────────────────────────────

  describe('params forwarding', () => {
    it('calls getBlocks without params when none provided', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      renderHook(() => useLedger());

      await waitFor(() => {
        expect(mockGetBlocks).toHaveBeenCalledOnce();
      });

      expect(mockGetBlocks).toHaveBeenCalledWith({});
    });

    it('forwards limit param to getBlocks', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      renderHook(() => useLedger({ limit: 25 }));

      await waitFor(() => {
        expect(mockGetBlocks).toHaveBeenCalledWith({ limit: 25 });
      });
    });

    it('forwards cursor param to getBlocks', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      renderHook(() => useLedger({ cursor: 'cursor-abc' }));

      await waitFor(() => {
        expect(mockGetBlocks).toHaveBeenCalledWith({ cursor: 'cursor-abc' });
      });
    });

    it('forwards milestoneEvent filter to getBlocks', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      renderHook(() => useLedger({ milestoneEvent: 'DELIVERED' }));

      await waitFor(() => {
        expect(mockGetBlocks).toHaveBeenCalledWith({ milestoneEvent: 'DELIVERED' });
      });
    });

    it('forwards shipmentId param to getBlocks', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      renderHook(() => useLedger({ shipmentId: 'ship-001' }));

      await waitFor(() => {
        expect(mockGetBlocks).toHaveBeenCalledWith({ shipmentId: 'ship-001' });
      });
    });

    it('forwards combined params to getBlocks', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      renderHook(() =>
        useLedger({ cursor: 'cursor-xyz', limit: 10, milestoneEvent: 'IN_TRANSIT' }),
      );

      await waitFor(() => {
        expect(mockGetBlocks).toHaveBeenCalledWith({
          cursor: 'cursor-xyz',
          limit: 10,
          milestoneEvent: 'IN_TRANSIT',
        });
      });
    });
  });

  // ── Refetch ───────────────────────────────────────────────────────────────

  describe('refetch', () => {
    it('re-calls getBlocks when refetch is invoked', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockGetBlocks).toHaveBeenCalledTimes(2);
      });
    });

    it('sets isLoading to true while refetching', async () => {
      let resolveSecond!: (v: PaginatedLedgerBlocks) => void;
      const secondFetch = new Promise<PaginatedLedgerBlocks>((res) => {
        resolveSecond = res;
      });

      mockGetBlocks
        .mockResolvedValueOnce(singlePageResponse)
        .mockReturnValueOnce(secondFetch);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveSecond(singlePageResponse);
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  // ── Return type shape ─────────────────────────────────────────────────────

  describe('return type', () => {
    it('exposes all expected fields', async () => {
      mockGetBlocks.mockResolvedValue(singlePageResponse);

      const { result } = renderHook(() => useLedger());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toMatchObject({
        entries: expect.any(Array),
        isLoading: expect.any(Boolean),
        error: null,
        refetch: expect.any(Function),
        hasMore: expect.any(Boolean),
        nextCursor: null,
      });
    });
  });
});
