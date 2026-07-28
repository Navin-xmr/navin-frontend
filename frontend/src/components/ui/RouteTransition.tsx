import React from 'react';
import { useRouteTransition } from '../../context/RouteTransitionContext';

const RouteTransition: React.FC = () => {
  const { isLoading } = useRouteTransition();

  return (
    <>
      {/* Page transition overlay and loading indicator */}
      <div
        className={`fixed inset-0 bg-black/10 backdrop-blur-sm z-40 pointer-events-none transition-opacity duration-300 ${
          isLoading ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!isLoading}
      />

      {/* Loading progress bar */}
      <div
        className={`fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-accent-blue to-primary transition-all duration-500 ease-out z-50 ${
          isLoading ? 'w-3/4' : 'w-0'
        }`}
        style={{
          animation: isLoading ? 'progress-bar 2s ease-in-out infinite' : 'none',
        }}
      />

      <style>{`
        @keyframes progress-bar {
          0% { width: 0; }
          50% { width: 75%; }
          100% { width: 75%; }
        }
      `}</style>
    </>
  );
};

export default RouteTransition;
