import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../common/Modal/Modal';
import { useToast } from '../../../context/ToastContext';
import { authApi } from '../../../services/api/endpoints/auth';

/** Minutes before expiry to show the warning modal. */
const WARN_BEFORE_MS = 2 * 60 * 1000; // 2 minutes

function getTokenExpiry(): number | null {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export interface SessionTimeoutModalProps {
  /** Called after a successful token refresh or sign-out, so the parent can
   *  re-schedule the next check. Leave undefined to use the built-in logic. */
  onSessionExtended?: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({ onSessionExtended }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(WARN_BEFORE_MS / 1000);

  // Refs keep mutable values accessible inside setInterval without stale closures
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const performLogout = (expired: boolean) => {
    clearTimers();
    setIsOpen(false);
    localStorage.removeItem('authToken');
    if (expired) {
      addToast('Your session has expired. Please sign in again.', 'error');
    }
    navigate('/login', { replace: true });
  };

  const schedule = () => {
    clearTimers();
    const expiry = getTokenExpiry();
    if (!expiry) return;

    const now = Date.now();
    const msUntilWarn = expiry - now - WARN_BEFORE_MS;
    const msUntilExpire = expiry - now;

    if (msUntilExpire <= 0) {
      performLogout(true);
      return;
    }

    if (msUntilWarn > 0) {
      warnTimerRef.current = setTimeout(() => {
        setIsOpen(true);
        setCountdown(Math.round(WARN_BEFORE_MS / 1000));
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => Math.max(0, prev - 1));
        }, 1000);
      }, msUntilWarn);
    } else {
      // Less than 2 min remaining on mount — show immediately
      setIsOpen(true);
      const remaining = Math.max(0, Math.round(msUntilExpire / 1000));
      setCountdown(remaining);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    expireTimerRef.current = setTimeout(() => {
      performLogout(true);
    }, msUntilExpire);
  };

  // Initial schedule on mount
  useEffect(() => {
    schedule();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleStaySignedIn = async () => {
    try {
      await authApi.refresh();
      clearTimers();
      setIsOpen(false);
      schedule();
      onSessionExtended?.();
    } catch {
      // If refresh fails, log the user out cleanly
      performLogout(false);
    }
  };

  const handleSignOut = () => {
    void authApi.logout().catch(() => {
      // Ignore logout API errors — we clear local state regardless
    });
    performLogout(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => undefined} // deliberate no-op: user must choose an action
      closeOnOverlayClick={false}
      closeOnEsc={false}
      title="Session Expiring Soon"
      size="sm"
      footer={
        <>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-background-elevated transition-colors"
          >
            Sign Out
          </button>
          <button
            onClick={() => void handleStaySignedIn()}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
          >
            Stay Signed In
          </button>
        </>
      }
    >
      <p>
        Your session will expire in{' '}
        <span className="font-semibold text-text-primary" aria-live="polite" aria-atomic="true">
          {formatCountdown(countdown)}
        </span>
        . Do you want to stay signed in?
      </p>
    </Modal>
  );
};

export default SessionTimeoutModal;
