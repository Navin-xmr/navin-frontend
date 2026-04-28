import React from "react";

interface State {
  hasError: boolean;
  error?: Error | null;
}

class ErrorBoundary extends React.Component<
  { children?: React.ReactNode },
  State
> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  // componentDidCatch intentionally omitted — getDerivedStateFromError is used to surface the error

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-text-primary">
          <div className="max-w-2xl text-left">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="mb-4 text-sm text-text-secondary">
              An unexpected error occurred while rendering the application. The
              error is shown below — please paste it into the issue or share it
              with the team.
            </p>
            <pre className="bg-[rgba(0,0,0,0.6)] p-3 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap">
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}

export default ErrorBoundary;
