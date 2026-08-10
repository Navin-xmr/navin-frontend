import React from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface State {
  hasError: boolean;
  error?: Error | null;
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  /** Optional custom fallback UI */
  fallback?: React.ReactNode | ((error: Error | null, resetError: () => void) => React.ReactNode);
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught an error:", error, info);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.state.error ?? null, this.resetError);
        }
        return this.props.fallback;
      }

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
            <p className="mb-6 text-sm text-text-secondary">
              An unexpected error occurred while rendering this part of the application.
              You can try again, or contact support if the problem persists.
            </p>

            <div className="mb-6">
              <pre className="bg-background-elevated border border-border p-4 rounded-lg text-xs text-left overflow-auto max-h-32 whitespace-pre-wrap text-text-secondary">
                {String(this.state.error)}
              </pre>
            </div>

            <button
              type="button"
              onClick={this.resetError}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-blue text-white font-semibold hover:bg-accent-blue/90 transition-colors cursor-pointer"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}

export default ErrorBoundary;
