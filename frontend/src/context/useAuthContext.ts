import { createContext, useContext } from 'react';
import type { UserRole } from '@utils/rbac';

export interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
  /** Re-reads the stored token so guards see a session created moments ago. */
  refresh: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
