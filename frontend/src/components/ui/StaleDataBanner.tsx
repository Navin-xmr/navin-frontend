import React, { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export interface StaleDataBannerProps {
  /** Whether the data is currently stale */
  isStale: boolean;
  /** Timestamp of the most recent data fetch */
  lastUpdated: Date | null;
  /** Callback invoked when the user clicks "Refresh" */
  onRefresh: () => void;
}

/**
 * A subtle, dismissible banner indicating that data is stale.
 * Shown at the top of a widget or page when `isStale` is `true`.
 *
 * Features:
 * - Displays last updated time
 * - "Refresh" button to re-fetch
 * - Dismissible with a close (X) button
 * - Accessible with proper aria-live region
 */
const StaleDataBanner: React.FC<StaleDataBannerProps> = ({ isStale, lastUpdated, onRefresh }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // If not stale or user dismissed it, hide the banner.
  if (!isStale || isDismissed) return null;

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'Unknown';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-yellow-700 bg-yellow-950/30 px-4 py-2.5 text-sm text-yellow-200"
    >
      <div className="flex items-center gap-2">
        <RefreshCw size={16} className="text-yellow-400" aria-hidden="true" />
        <span>
          Data may be outdated. Last updated: <strong>{formattedTime}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh data"
          className="inline-flex items-center gap-1.5 rounded bg-yellow-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-yellow-950"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Refresh
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss stale data notice"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-yellow-300 transition-colors hover:bg-yellow-900/50 hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-yellow-950"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default StaleDataBanner;
