import { useCallback, useEffect, useState } from 'react';
import { shipmentApi, type ShipmentStatus } from '@services/api/endpoints/shipments';

/** The statuses the dashboard counts, in display order. */
export const STAT_STATUSES: ShipmentStatus[] = ['IN_TRANSIT', 'DELIVERED', 'CREATED', 'CANCELLED'];

/** The shipments API is cursor-paged and reports no totals, so each status is counted over one page. */
export const COUNT_PAGE_SIZE = 100;

export interface StatusCount {
  status: ShipmentStatus;
  count: number;
  /** More shipments exist than were counted, so `count` is a lower bound. */
  hasMore: boolean;
}

export interface UseShipmentStatusCountsReturn {
  counts: StatusCount[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/** Counts the company's shipments per status from the shipments API. */
export function useShipmentStatusCounts(refreshKey = 0): UseShipmentStatusCountsReturn {
  const [counts, setCounts] = useState<StatusCount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const retry = useCallback(() => setRetryKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const pages = await Promise.all(
          STAT_STATUSES.map((status) => shipmentApi.getAll({ status, limit: COUNT_PAGE_SIZE })),
        );
        if (cancelled) return;

        setCounts(
          pages.map((page, index) => ({
            status: STAT_STATUSES[index],
            count: page.data.length,
            hasMore: page.meta.hasMore,
          })),
        );
      } catch (e) {
        if (cancelled) return;
        setCounts([]);
        setError(e instanceof Error ? e.message : 'Failed to load shipment counts');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, retryKey]);

  return { counts, isLoading, error, retry };
}
