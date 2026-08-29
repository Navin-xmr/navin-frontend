import React, { useState, useEffect, useRef } from 'react';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { useToast } from '../../../context/ToastContext';

const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { addToast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  // Only announce "back online" once we've actually observed an offline
  // stretch in this session, so the toast doesn't fire on initial mount.
  const wasOffline = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-arm the banner on every online/offline transition reported by useOnlineStatus
    setDismissed(false);
    if (isOnline) {
      if (wasOffline.current) {
        addToast("You're back online.", "success", undefined, "connection-restored");
        wasOffline.current = false;
      }
    } else {
      wasOffline.current = true;
    }
  }, [isOnline, addToast]);

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
