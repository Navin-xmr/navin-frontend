import { useCallback, useEffect, useState } from 'react';
import { decodeJwt } from 'jose';
import { toUserRole, type UserRole } from '@utils/rbac';
import { onTokenChange } from '../services/auth/tokenStorage';

const AUTH_STORAGE_KEY = 'authToken';
const AUTH_CHECK_DELAY_MS = 150;

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
}

export interface UseAuthResult extends AuthState {
  /** Re-reads the stored token immediately (e.g. right after login). */
  refresh: () => void;
}

function parseToken(token: string): { role: UserRole | null; userId: string | null; expired: boolean; valid: boolean } {
  try {
    const payload = decodeJwt(token);
    const expired = typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp;
    const role = toUserRole(payload.role);
    const userId = (payload.sub ?? (payload.userId as string | undefined) ?? null) as string | null;
    return { role, userId, expired, valid: true };
  } catch {
    return { role: null, userId: null, expired: false, valid: false };
  }
}

export function useAuth(): UseAuthResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!token) {
      setIsAuthenticated(false);
      setRole(null);
      setUserId(null);
      setIsLoading(false);
      return;
    }

    const parsed = parseToken(token);

    if (!parsed.valid || parsed.expired) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthenticated(false);
      setRole(null);
      setUserId(null);
    } else if (!parsed.role) {
      // A structurally valid token whose role this build does not recognise.
      // Nothing is authorised for it, so it must not be reported as an
      // authenticated session — that is what would let it reach a guarded
      // route. The token stays in storage on purpose: it is not malformed,
      // and clearing it would sign the user out of an account whose role
      // this frontend is simply behind on.
      setIsAuthenticated(false);
      setRole(null);
      setUserId(null);
    } else {
      setIsAuthenticated(true);
      setRole(parsed.role);
      setUserId(parsed.userId);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refresh, AUTH_CHECK_DELAY_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Login, signup and token refresh write through tokenStorage; re-check
    // synchronously so route guards see the new session before navigation.
    const unsubscribe = onTokenChange(refresh);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe();
    };
  }, [refresh]);

  return { isLoading, isAuthenticated, role, userId, refresh };
}
