import { useCallback, useEffect, useRef, useState } from 'react';

type RefreshStatus = 'idle' | 'refreshing' | 'success' | 'error';

interface UseWidgetRefreshOptions {
  onRefresh: () => Promise<void>;
  intervalMs?: number;
  successDisplayMs?: number;
}

interface UseWidgetRefreshReturn {
  status: RefreshStatus;
  lastRefreshedAt: Date | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export default function useWidgetRefresh({
  onRefresh,
  intervalMs = 0,
  successDisplayMs = 2000,
}: UseWidgetRefreshOptions): UseWidgetRefreshReturn {
  const [status, setStatus] = useState<RefreshStatus>('idle');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    setStatus('refreshing');
    try {
      await onRefresh();
      setLastRefreshedAt(new Date());
      setStatus('success');
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setStatus('idle');
      }, successDisplayMs);
    } catch {
      setStatus('error');
    }
  }, [onRefresh, successDisplayMs]);

  useEffect(() => {
    if (intervalMs <= 0) return;
    const id = setInterval(() => {
      refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, refresh]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  return { status, lastRefreshedAt, refresh, isRefreshing: status === 'refreshing' };
}
