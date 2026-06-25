import React, { useState, useEffect, useCallback } from 'react';

interface OfflineBannerProps {
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  const [isOffline, setIsOffline] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      if (!baseURL) {
        setIsOffline(true);
        return;
      }

      await fetch(`${baseURL}/health`, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      });
      
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkConnection();

    const handleOnline = () => checkConnection();
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  const handleRetry = () => {
    checkConnection();
    onRetry?.();
  };

  if (!isOffline) return null;

  return (
    <div 
      className="bg-red-500 text-white px-4 py-3 text-center flex items-center justify-center gap-4"
      role="alert"
      aria-live="polite"
    >
      <span className="text-sm font-medium">
        Unable to connect to server. Please check your connection.
      </span>
      <button
        onClick={handleRetry}
        className="bg-white text-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors"
        aria-label="Retry connection"
      >
        Retry
      </button>
    </div>
  );
};

export default OfflineBanner;
