import { useCallback, useEffect, useRef, useState } from 'react';
import { ledgerApi } from '@services/api/endpoints/ledger';
import type { GetLedgerBlocksParams, LedgerBlock, MilestoneEvent } from '@services/api/endpoints/ledger';

export const DEFAULT_LEDGER_PAGE_LIMIT = 15;

export interface UseLedgerOptions {
  cursor?: string | null;
  milestoneEvent?: MilestoneEvent | '';
  limit?: number;
}

export interface UseLedgerResult {
  entries: LedgerBlock[];
  total: number | undefined;
  hasMore: boolean;
  nextCursor: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches on-chain ledger records from the backend, optionally scoped to one
 * shipment. Re-fetches whenever the shipment, cursor, filter or page size
 * changes; `refetch` repeats the current request (e.g. from a retry button).
 */
export function useLedger(
  shipmentId?: string,
  { cursor = null, milestoneEvent = '', limit = DEFAULT_LEDGER_PAGE_LIMIT }: UseLedgerOptions = {},
): UseLedgerResult {
  const [entries, setEntries] = useState<LedgerBlock[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Only the latest request may write state, so a slow response for an old
  // page or filter can't overwrite the one the user is looking at.
  const latestRequestId = useRef(0);

  const refetch = useCallback(() => {
    const requestId = ++latestRequestId.current;
    const params: GetLedgerBlocksParams = { limit };
    if (cursor) params.cursor = cursor;
    if (milestoneEvent) params.milestoneEvent = milestoneEvent;
    if (shipmentId) params.shipmentId = shipmentId;

    setIsLoading(true);
    setError(null);

    ledgerApi
      .getBlocks(params)
      .then((result) => {
        if (requestId !== latestRequestId.current) return;
        setEntries(result.data);
        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor);
        if (result.total !== undefined) setTotal(result.total);
      })
      .catch((err: unknown) => {
        if (requestId !== latestRequestId.current) return;
        setError(err instanceof Error ? err : new Error('Failed to load blockchain ledger data.'));
      })
      .finally(() => {
        if (requestId === latestRequestId.current) setIsLoading(false);
      });
  }, [shipmentId, cursor, milestoneEvent, limit]);

  useEffect(() => {
    const timer = setTimeout(refetch, 0);
    return () => clearTimeout(timer);
  }, [refetch]);

  return { entries, total, hasMore, nextCursor, isLoading, error, refetch };
}
