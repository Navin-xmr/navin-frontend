import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: unknown;
  componentStack?: string | null;
  eventId?: string;
  resetError?: () => void;
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps): React.ReactElement {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-background text-text-primary"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-lg text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle size={32} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-text-secondary text-sm mb-6">
          An unexpected error occurred. Our team has been notified.
          You can try again below.
        </p>
        <pre className="bg-background-elevated border border-border p-4 rounded-lg text-xs text-left overflow-auto max-h-40 whitespace-pre-wrap text-text-secondary mb-6">
          {message}
        </pre>
        {resetError && (
          <button
            onClick={resetError}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-blue text-white font-semibold hover:bg-accent-blue/90 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorFallback;
