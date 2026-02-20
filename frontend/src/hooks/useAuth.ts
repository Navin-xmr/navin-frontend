import { useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = 'authToken';
const AUTH_CHECK_DELAY_MS = 150;

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasAuthToken = Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
      setIsAuthenticated(hasAuthToken);
      setIsLoading(false);
    }, AUTH_CHECK_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return { isLoading, isAuthenticated };
}

