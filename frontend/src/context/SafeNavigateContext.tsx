import React, { createContext, useContext } from 'react';
import { useNavigate as useNavigateRouter, NavigateFunction } from 'react-router-dom';

const SafeNavigateContext = createContext<NavigateFunction | null>(null);

export const SafeNavigateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let navigate: NavigateFunction;
  try {
    navigate = useNavigateRouter();
  } catch {
    navigate = ((path: string | number) => {
      if (typeof path === 'number') {
        window.history.go(path);
      } else {
        window.location.href = path;
      }
    }) as NavigateFunction;
  }

  return (
    <SafeNavigateContext.Provider value={navigate}>
      {children}
    </SafeNavigateContext.Provider>
  );
};

export function useSafeNavigate(): NavigateFunction {
  const ctx = useContext(SafeNavigateContext);
  if (!ctx) {
    return ((path: string | number) => {
      if (typeof path === 'number') {
        window.history.go(path);
      } else {
        window.location.href = path;
      }
    }) as NavigateFunction;
  }
  return ctx;
}
