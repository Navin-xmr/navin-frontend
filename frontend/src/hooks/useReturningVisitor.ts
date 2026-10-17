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
function recordVisitInStorage(visitCount: number, lastVisit: string): void {
  try {
    localStorage.setItem(RETURNING_VISITOR_KEY, 'true');
    localStorage.setItem(VISIT_COUNT_KEY, String(visitCount));
    localStorage.setItem(LAST_VISIT_KEY, lastVisit);
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
}

export function useReturningVisitor(): ReturningVisitorState & { markVisited: () => void } {
  const [state, setState] = useState<ReturningVisitorState>(() => {
    const now = new Date().toISOString();
    try {
      const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
      return {
        isReturning: true,
        visitCount: currentCount + 1,
        lastVisit: now,
        daysSinceLastVisit: 0,
      };
    } catch {
      return { isReturning: false, visitCount: 0, lastVisit: null, daysSinceLastVisit: null };
    }
  });

  const markVisited = () => {
    try {
      const now = new Date().toISOString();
      const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
      const nextCount = currentCount + 1;
      recordVisitInStorage(nextCount, now);
      setState({
        isReturning: true,
        visitCount: nextCount,
        lastVisit: now,
        daysSinceLastVisit: 0,
      });
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }
  };

  useEffect(() => {
    if (state.lastVisit !== null) {
      recordVisitInStorage(state.visitCount, state.lastVisit);
    }
    // Only persist initial visit on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, markVisited };
}
