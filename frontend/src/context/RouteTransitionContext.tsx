import React, { createContext, useContext, useState } from 'react';

export interface RouteTransitionContextValue {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export const RouteTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <RouteTransitionContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </RouteTransitionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useRouteTransition(): RouteTransitionContextValue {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) throw new Error('useRouteTransition must be used inside <RouteTransitionProvider>');
  return ctx;
}
