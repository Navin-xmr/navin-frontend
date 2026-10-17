import { createContext, useContext } from 'react';

export interface RouteTransitionContextValue {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export function useRouteTransition(): RouteTransitionContextValue {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) throw new Error('useRouteTransition must be used inside <RouteTransitionProvider>');
  return ctx;
}
