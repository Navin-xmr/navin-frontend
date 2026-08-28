import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

interface UseWidgetCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  refresh: () => void;
  lastUpdated: number | null;
}

// Module-level map shared across all instances
const widgetCacheMap = new Map<string, CacheEntry<unknown>>();

export default function useWidgetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 30000,
): UseWidgetCacheReturn<T> {
  const { pathname } = useLocation();
  const cacheKey = `${pathname}@@${key}`;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsStale(false);
    try {
      const result = await fetcher();
      const entry: CacheEntry<T> = { data: result, cachedAt: Date.now() };
      widgetCacheMap.set(cacheKey, entry as CacheEntry<unknown>);
      setData(result);
      setLastUpdated(entry.cachedAt);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, fetcher]);

  const refresh = useCallback(() => {
    widgetCacheMap.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);

  useEffect(() => {
    queueMicrotask(async () => {
      const cached = widgetCacheMap.get(cacheKey) as CacheEntry<T> | undefined;
      if (!cached) {
        await fetchData();
        return;
      }
      const age = Date.now() - cached.cachedAt;
      if (age > ttlMs) {
        setIsStale(true);
        await fetchData();
      } else {
        setData(cached.data);
        setLastUpdated(cached.cachedAt);
      }
    });
  }, [cacheKey, ttlMs, fetchData]);

  return { data, isLoading, isStale, refresh, lastUpdated };
}
