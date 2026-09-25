import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useLedger } from './useLedger';
import type { LedgerBlock, PaginatedLedgerBlocks } from '@services/api/endpoints/ledger';

vi.mock('@services/api/endpoints/ledger', () => ({
  ledgerApi: {
    getBlocks: vi.fn(),
  },
}));

import { ledgerApi } from '@services/api/endpoints/ledger';

const mockGetBlocks = ledgerApi.getBlocks as ReturnType<typeof vi.fn>;

const block: LedgerBlock = {
  blockNumber: 50_000_001,
  timestamp: '2024-03-15T10:30:00.000Z',
  shipmentId: 'ship-001',
  shipmentReference: 'NAV-2024-001',
  milestoneEvent: 'DELIVERED',
  transactionHash: 'a'.repeat(64),
  ledger: 50_000_001,
  verified: true,
};

const response: PaginatedLedgerBlocks = {
  data: [block],
  nextCursor: 'cursor-2',
  hasMore: true,
  total: 42,
};

describe('useLedger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in a loading state with no entries', () => {
    mockGetBlocks.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useLedger());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.entries).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns entries and pagination metadata from the API', async () => {
    mockGetBlocks.mockResolvedValue(response);
    const { result } = renderHook(() => useLedger());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.entries).toEqual([block]);
    expect(result.current.total).toBe(42);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.nextCursor).toBe('cursor-2');
    expect(mockGetBlocks).toHaveBeenCalledWith({ limit: 15 });
  });

  it('scopes the request to a shipment when shipmentId is given', async () => {
    mockGetBlocks.mockResolvedValue(response);
    renderHook(() => useLedger('ship-001'));

    await waitFor(() => {
      expect(mockGetBlocks).toHaveBeenCalledWith({ limit: 15, shipmentId: 'ship-001' });
    });
  });

  it('passes cursor, filter and limit options through to the API', async () => {
    mockGetBlocks.mockResolvedValue(response);
    renderHook(() =>
      useLedger(undefined, { cursor: 'cursor-2', milestoneEvent: 'IN_TRANSIT', limit: 5 }),
    );

    await waitFor(() => {
      expect(mockGetBlocks).toHaveBeenCalledWith({
        limit: 5,
        cursor: 'cursor-2',
        milestoneEvent: 'IN_TRANSIT',
      });
    });
  });

  it('exposes the error when the request fails', async () => {
    mockGetBlocks.mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useLedger());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network Error');
    expect(result.current.entries).toEqual([]);
  });

  it('refetch() repeats the request and clears a previous error', async () => {
    mockGetBlocks
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(response);
    const { result } = renderHook(() => useLedger());

    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.entries).toEqual([block]));
    expect(result.current.error).toBeNull();
    expect(mockGetBlocks).toHaveBeenCalledTimes(2);
  });

  it('ignores a stale response that resolves after a newer request', async () => {
    let resolveFirst: (value: PaginatedLedgerBlocks) => void = () => undefined;
    const staleBlock: LedgerBlock = { ...block, shipmentReference: 'NAV-STALE' };
    mockGetBlocks
      .mockReturnValueOnce(
        new Promise<PaginatedLedgerBlocks>((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockResolvedValueOnce(response);

    const { result, rerender } = renderHook(
      ({ filter }: { filter: '' | 'DELIVERED' }) => useLedger(undefined, { milestoneEvent: filter }),
      { initialProps: { filter: '' as '' | 'DELIVERED' } },
    );

    await waitFor(() => expect(mockGetBlocks).toHaveBeenCalledTimes(1));
    rerender({ filter: 'DELIVERED' });
    await waitFor(() => expect(result.current.entries).toEqual([block]));

    await act(async () => {
      resolveFirst({ ...response, data: [staleBlock] });
    });

    expect(result.current.entries).toEqual([block]);
  });
});
