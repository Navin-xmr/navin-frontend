import { useEffect, useState } from 'react';
import { decodeJwt } from 'jose';
import type { UserRole } from '@utils/rbac';

const AUTH_STORAGE_KEY = 'authToken';
const AUTH_CHECK_DELAY_MS = 150;

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
}

function parseToken(token: string): { role: UserRole | null; userId: string | null; expired: boolean } {
  try {
    const payload = decodeJwt(token);
    const expired = typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp;
    const role = (payload.role as UserRole) || null;
    const userId = (payload.sub ?? (payload.userId as string | undefined) ?? null) as string | null;
    return { role, userId, expired };
  } catch {
    return { role: null, userId: null, expired: false };
  }
}

export function useAuth(): AuthState {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const token = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const parsed = parseToken(token);

      if (parsed.expired) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setRole(parsed.role);
        setUserId(parsed.userId);
      }

      setIsLoading(false);
    }, AUTH_CHECK_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return { isLoading, isAuthenticated, role, userId };
}
