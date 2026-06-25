import React from 'react';

interface ErrorFallbackProps {
  error: unknown;
  componentStack?: string | null;
  resetError?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white">
      <div className="max-w-lg text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>
        <pre className="bg-gray-100 dark:bg-[rgba(0,0,0,0.6)] p-4 rounded-lg text-xs text-left overflow-auto max-h-40 whitespace-pre-wrap text-gray-700 dark:text-gray-300 mb-6">
          {message}
        </pre>
        {resetError && (
          <button
            onClick={resetError}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
