import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import type { RefreshStatus } from '@hooks/useWidgetRefresh';

export interface WidgetRefreshIndicatorProps {
  status: RefreshStatus;
  lastRefreshedAt: Date | null;
  onRefresh: () => void;
  /** Hide the last-refreshed timestamp. Defaults to false. */
  hideTimestamp?: boolean;
  className?: string;
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * WidgetRefreshIndicator
 *
 * Renders a compact refresh button with stateful feedback for live dashboard
 * widgets. Pair with `useWidgetRefresh` for a complete solution.
 *
 * @example
 * <WidgetRefreshIndicator
 *   status={status}
 *   lastRefreshedAt={lastRefreshedAt}
 *   onRefresh={refresh}
 * />
 */
const WidgetRefreshIndicator: React.FC<WidgetRefreshIndicatorProps> = ({
  status,
  lastRefreshedAt,
  onRefresh,
  hideTimestamp = false,
  className = '',
}) => {
  const isRefreshing = status === 'refreshing';

  const iconMap: Record<RefreshStatus, React.ReactNode> = {
    idle: (
      <RefreshCw
        size={14}
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:rotate-180"
      />
    ),
    refreshing: (
      <RefreshCw
        size={14}
        aria-hidden="true"
        className="animate-spin"
      />
    ),
    success: (
      <CheckCircle
        size={14}
        aria-hidden="true"
        className="text-accent-green"
      />
    ),
    error: (
      <AlertCircle
        size={14}
        aria-hidden="true"
        className="text-accent-red"
      />
    ),
  };

  const buttonColorMap: Record<RefreshStatus, string> = {
    idle: 'text-text-secondary hover:text-white',
    refreshing: 'text-accent-blue cursor-not-allowed',
    success: 'text-accent-green',
    error: 'text-accent-red hover:text-red-300',
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {!hideTimestamp && lastRefreshedAt && (
        <span className="text-[11px] text-text-secondary tabular-nums">
          {formatRelativeTime(lastRefreshedAt)}
        </span>
      )}

      {status === 'error' && (
        <span className="text-[11px] text-accent-red">Failed to refresh</span>
      )}

      <button
        type="button"
        aria-label={isRefreshing ? 'Refreshing…' : 'Refresh widget data'}
        aria-disabled={isRefreshing}
        disabled={isRefreshing}
        onClick={onRefresh}
        className={`group flex items-center justify-center rounded-md p-1 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue ${buttonColorMap[status]}`}
      >
        {iconMap[status]}
      </button>
    </div>
  );
};

export default WidgetRefreshIndicator;
