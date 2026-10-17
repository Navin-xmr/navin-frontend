import React, { useState } from 'react';
import { RouteTransitionContext } from './useRouteTransition';

export const RouteTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <RouteTransitionContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </RouteTransitionContext.Provider>
  );
};
