import React, { useState, useCallback } from 'react';
import { useSlowConnection } from '../../../hooks/useSlowConnection';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

const SlowConnectionBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  // Re-arm the banner for a fresh slow spell whenever the browser reports
  // a change, so a stale dismissal doesn't hide a brand-new slowdown.
  const handleChange = useCallback((slow: boolean) => {
    if (slow) setDismissed(false);
  }, []);
  const isSlow = useSlowConnection(handleChange);

  // Mutually exclusive with OfflineBanner: only warn about a slow
  // connection while actually online, so the two banners never stack.
  if (!isOnline || !isSlow || dismissed) return null;

  return (
    <div
      className="bg-slate-700 text-white px-4 py-3 text-center flex items-center justify-center gap-4 fixed top-0 left-0 right-0 z-[9999]"
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium">
        Your connection appears slow — some actions may take longer than usual.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="bg-white text-slate-700 px-3 py-1 rounded text-sm font-medium hover:bg-slate-100 transition-colors"
        aria-label="Dismiss slow connection banner"
      >
        Dismiss
      </button>
    </div>
  );
};

export default SlowConnectionBanner;
