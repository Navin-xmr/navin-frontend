import { useState, useEffect } from 'react';

const RETURNING_VISITOR_KEY = 'navin_returning_visitor';
const VISIT_COUNT_KEY = 'navin_visit_count';
const LAST_VISIT_KEY = 'navin_last_visit';

export interface ReturningVisitorState {
  isReturning: boolean;
  visitCount: number;
  lastVisit: string | null;
  daysSinceLastVisit: number | null;
}

/**
 * Detects whether the current user is a returning visitor to the Navin platform.
 * Stores visit data in localStorage and provides personalized state.
 */
export function useReturningVisitor(): ReturningVisitorState & { markVisited: () => void } {
  const [state, setState] = useState<ReturningVisitorState>(() => {
    try {
      const isReturning = localStorage.getItem(RETURNING_VISITOR_KEY) === 'true';
      const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY);

      let daysSinceLastVisit: number | null = null;
      if (lastVisit) {
        const last = new Date(lastVisit);
        const now = new Date();
        daysSinceLastVisit = Math.floor(
          (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
        );
      }

      return { isReturning, visitCount, lastVisit, daysSinceLastVisit };
    } catch {
      return { isReturning: false, visitCount: 0, lastVisit: null, daysSinceLastVisit: null };
    }
  });

  const markVisited = () => {
    try {
      const now = new Date().toISOString();
      const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
      localStorage.setItem(RETURNING_VISITOR_KEY, 'true');
      localStorage.setItem(VISIT_COUNT_KEY, String(currentCount + 1));
      localStorage.setItem(LAST_VISIT_KEY, now);
      setState({
        isReturning: true,
        visitCount: currentCount + 1,
        lastVisit: now,
        daysSinceLastVisit: 0,
      });
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- record visit on mount
    markVisited();
  }, []);

  return { ...state, markVisited };
}
