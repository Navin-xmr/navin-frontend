import { useNavigate as useNavigateRouter } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Safe wrapper for useNavigate that prevents errors when called
 * outside of Router context (e.g., in error boundaries)
 */
export function useSafeNavigate(): NavigateFunction {
  try {
    return useNavigateRouter();
  } catch {
    // Return a no-op function if Router context is not available
    return ((path: string | number) => {
      if (typeof path === 'number') {
        window.history.go(path);
      } else {
        window.location.href = path;
      }
    }) as NavigateFunction;
  }
}
