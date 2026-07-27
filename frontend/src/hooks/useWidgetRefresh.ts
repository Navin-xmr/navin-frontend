import { useCallback, useEffect, useRef, useState } from 'react';

export type RefreshStatus = 'idle' | 'refreshing' | 'success' | 'error';

export interface UseWidgetRefreshOptions {
  /**
   * Async function that fetches / reloads data.
   * Throw an error to trigger the 'error' status.
   */
  onRefresh: () => Promise<void>;
  /**
   * Auto-refresh interval in milliseconds.
   * Set to 0 (default) to disable auto-refresh.
   */
  intervalMs?: number;
  /**
   * How many ms to hold the 'success' status before reverting to 'idle'.
   * Defaults to 2000.
   */
  successDisplayMs?: number;
}

export interface UseWidgetRefreshReturn {
  /** Current refresh status. */
  status: RefreshStatus;
  /** Last time a successful refresh completed. */
  lastRefreshedAt: Date | null;
  /** Trigger a manual refresh. */
  refresh: () => void;
  /** True while a refresh is in progress. */
  isRefreshing: boolean;
}

/**
 * useWidgetRefresh
 *
 * Manages manual and auto-refresh state for live dashboard widgets.
 * Provides typed status so the widget header can render appropriate
 * indicators without ad-hoc local state.
 *
 * @example
 * const { status, lastRefreshedAt, refresh, isRefreshing } = useWidgetRefresh({
 *   onRefresh: fetchLiveData,
 *   intervalMs: 30_000,
 * });
 */
function useWidgetRefresh({
  onRefresh,
  intervalMs = 0,
  successDisplayMs = 2000,
}: UseWidgetRefreshOptions): UseWidgetRefreshReturn {
  const [status, setStatus] = useState<RefreshStatus>('idle');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const onRefreshRef = useRef(onRefresh);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  onRefreshRef.current = onRefresh;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;
    setStatus('refreshing');
    try {
      await onRefreshRef.current();
      if (!isMountedRef.current) return;
      setLastRefreshedAt(new Date());
      setStatus('success');
      // Revert to idle after successDisplayMs
      successTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) setStatus('idle');
      }, successDisplayMs);
    } catch {
      if (!isMountedRef.current) return;
      setStatus('error');
    }
  }, [successDisplayMs]);

  // Auto-refresh interval
  useEffect(() => {
    if (!intervalMs || intervalMs <= 0) return;
    const id = setInterval(() => {
      void refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, refresh]);

  return {
    status,
    lastRefreshedAt,
    refresh,
    isRefreshing: status === 'refreshing',
  };
}

export default useWidgetRefresh;
