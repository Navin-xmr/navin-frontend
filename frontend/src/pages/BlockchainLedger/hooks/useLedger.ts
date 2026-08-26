import { useCallback, useEffect, useState } from 'react';
import { ledgerApi } from '@services/api/endpoints/ledger';
import type { LedgerBlock, GetLedgerBlocksParams } from '@services/api/endpoints/ledger';

export interface UseLedgerReturn {
  entries: LedgerBlock[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  total?: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export function useLedger(params?: GetLedgerBlocksParams): UseLedgerReturn {
  const [entries, setEntries] = useState<LedgerBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const cursor = params?.cursor;
  const limit = params?.limit;
  const shipmentId = params?.shipmentId;
  const milestoneEvent = params?.milestoneEvent;

  const fetchLedger = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const getParams: GetLedgerBlocksParams = {};
      if (limit !== undefined) getParams.limit = limit;
      if (cursor !== undefined) getParams.cursor = cursor;
      if (shipmentId !== undefined) getParams.shipmentId = shipmentId;
      if (milestoneEvent !== undefined) getParams.milestoneEvent = milestoneEvent;

      const result = await ledgerApi.getBlocks(getParams);
      setEntries(result.data);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
      if (result.total !== undefined) {
        setTotal(result.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blockchain ledger data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [cursor, limit, shipmentId, milestoneEvent]);

  useEffect(() => {
    void fetchLedger(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchLedger]);

  return {
    entries,
    isLoading,
    error,
    refetch: fetchLedger,
    total,
    hasMore,
    nextCursor,
  };
}
