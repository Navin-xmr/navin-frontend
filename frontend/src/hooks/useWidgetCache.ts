import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Module-level cache — shared across all hook instances within the session.
// Key format: "<routePath>@@<widgetKey>"
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  fetchedAt: number; // epoch ms
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const widgetCacheMap = new Map<string, CacheEntry<any>>();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseWidgetCacheOptions {
  /** Time-to-live in milliseconds before cached data is considered stale. Default: 30 000 ms */
  ttlMs?: number;
}

export interface UseWidgetCacheReturn<T> {
  /** The fetched (or cached) data, or `null` while loading for the first time */
  data: T | null;
  /** True while a fetch is in flight */
  isLoading: boolean;
  /** True when cached data exists but is older than `ttlMs` */
  isStale: boolean;
  /** Timestamp of the most recent successful fetch, or `null` before first fetch */
  lastUpdated: Date | null;
  /** Force a fresh fetch regardless of TTL */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Route-aware, TTL-based cache for dashboard widget data.
 *
 * - Cache is keyed by both the widget `key` and the current route path so
 *   each route maintains its own independent cache entry.
 * - On mount (or route re-visit) the hook checks the TTL:
 *   - Fresh data → returned immediately, no loading state triggered.
 *   - Stale/missing data → fetch is triggered automatically.
 * - `refresh()` forces a re-fetch and updates the cache.
 *
 * @example
 * ```tsx
 * const { data, isLoading, isStale, refresh, lastUpdated } =
 *   useWidgetCache('shipment-stats', fetchShipmentStats, { ttlMs: 60_000 });
 * ```
 */
function useWidgetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseWidgetCacheOptions,
): UseWidgetCacheReturn<T> {
  const { pathname } = useLocation();
  const ttlMs = options?.ttlMs ?? 30_000;

  // Stable cache key that combines route + widget key
  const cacheKey = `${pathname}@@${key}`;

  // Keep a ref so the effect closure always sees the latest fetcher without
  // adding it to the dependency array (avoids infinite loops when the caller
  // passes an inline arrow function).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // -------------------------------------------------------------------------
  // Derive initial state from whatever is already in the cache.
  // -------------------------------------------------------------------------
  const getCachedEntry = useCallback((): CacheEntry<T> | undefined => {
    return widgetCacheMap.get(cacheKey) as CacheEntry<T> | undefined;
  }, [cacheKey]);

  const isEntryStale = useCallback(
    (entry: CacheEntry<T>): boolean => {
      return Date.now() - entry.fetchedAt > ttlMs;
    },
    [ttlMs],
  );

  const initialEntry = getCachedEntry();
  const initialIsStale = initialEntry ? isEntryStale(initialEntry) : false;

  const [data, setData] = useState<T | null>(initialEntry?.data ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(
    // Only show loading on first load; fresh cached data skips the spinner.
    !initialEntry || initialIsStale,
  );
  const [isStale, setIsStale] = useState<boolean>(initialIsStale);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    initialEntry ? new Date(initialEntry.fetchedAt) : null,
  );

  // -------------------------------------------------------------------------
  // Core fetch logic
  // -------------------------------------------------------------------------
  const runFetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcherRef.current();
      const fetchedAt = Date.now();
      widgetCacheMap.set(cacheKey, { data: result, fetchedAt });
      setData(result);
      setLastUpdated(new Date(fetchedAt));
      setIsStale(false);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey]);

  // -------------------------------------------------------------------------
  // Effect: run on mount and whenever the cache key changes (i.e., route
  // navigation returns to this widget's route).
  // -------------------------------------------------------------------------
  useEffect(() => {
    const entry = getCachedEntry();

    if (!entry) {
      // No cached data at all — fetch immediately.
      void runFetch();
      return;
    }

    if (isEntryStale(entry)) {
      // Data exists but is past TTL — mark stale and re-fetch.
      setData(entry.data); // keep showing stale data while re-fetching
      setIsStale(true);
      void runFetch();
    } else {
      // Fresh cached data — hydrate state without a loading spinner.
      setData(entry.data);
      setIsStale(false);
      setLastUpdated(new Date(entry.fetchedAt));
      setIsLoading(false);
    }
  }, [cacheKey, getCachedEntry, isEntryStale, runFetch]);

  // -------------------------------------------------------------------------
  // Public refresh — invalidates the entry and forces a re-fetch.
  // -------------------------------------------------------------------------
  const refresh = useCallback(() => {
    widgetCacheMap.delete(cacheKey);
    void runFetch();
  }, [cacheKey, runFetch]);

  return { data, isLoading, isStale, refresh, lastUpdated };
}

export default useWidgetCache;
