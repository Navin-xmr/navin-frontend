import React, { useCallback } from 'react';
import { useAuth } from '@hooks/useAuth';
import { logoutSession } from '../services/auth/logoutSession';
import { redirectToLogin } from '../services/auth/sessionRedirect';
import { useWallet } from './useWallet';
import { AuthContext } from './useAuthContext';

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
