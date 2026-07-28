import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export interface ChartErrorProps {
  /** Error message to display */
  message?: string;
  /** Optional callback to retry loading */
  onRetry?: () => void;
  /** Height of the error container in pixels */
  height?: number;
}

const ChartError: React.FC<ChartErrorProps> = ({
  message = "Failed to load chart data.",
  onRetry,
  height = 300,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center"
      style={{ minHeight: height }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
        <AlertTriangle size={24} aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="text-sm font-semibold text-text-primary">Chart Error</h3>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background-elevated text-sm font-medium text-text-primary hover:border-accent-blue hover:text-accent-blue transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ChartError;
