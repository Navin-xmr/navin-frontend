import React, { useState, useEffect } from 'react';

const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); setDismissed(false); };
    const handleOffline = () => { setIsOnline(false); setDismissed(false); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <div
      className="bg-amber-500 text-white px-4 py-3 text-center flex items-center justify-center gap-4 fixed top-0 left-0 right-0 z-[9999]"
      role="alert"
      aria-live="polite"
    >
      <span className="text-sm font-medium">
        You are offline — displaying cached data. Some features are unavailable.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="bg-white text-amber-600 px-3 py-1 rounded text-sm font-medium hover:bg-amber-50 transition-colors"
        aria-label="Dismiss offline banner"
      >
        Dismiss
      </button>
    </div>
  );
};

export default OfflineBanner;
