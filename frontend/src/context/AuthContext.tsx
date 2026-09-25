import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from '@hooks/useAuth';
import type { UserRole } from '@utils/rbac';
import { logoutSession } from '../services/auth/logoutSession';
import { redirectToLogin } from '../services/auth/sessionRedirect';
import { useWallet } from './WalletContext';

export interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { disconnect } = useWallet();

  const logout = useCallback(async () => {
    // Clear wallet state before redirecting so a subsequent user on the same
    // browser session doesn't inherit the previous user's connected wallet.
    void disconnect();
    await logoutSession();
    redirectToLogin();
  }, [disconnect]);

  return (
    <AuthContext.Provider value={{ ...auth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
