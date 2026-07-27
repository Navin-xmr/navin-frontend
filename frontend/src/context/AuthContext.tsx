import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from '@hooks/useAuth';
import type { UserRole } from '@utils/rbac';

export interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }, []);

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
