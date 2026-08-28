import { useCallback, useEffect, useState } from 'react';

const RETURNING_KEY = 'navin_returning_visitor';
const COUNT_KEY = 'navin_visit_count';
const LAST_VISIT_KEY = 'navin_last_visit';

interface UseReturningVisitorReturn {
  isReturning: boolean;
  visitCount: number;
  lastVisit: string | null;
  daysSinceLastVisit: number | null;
  markVisited: () => void;
}

export function useReturningVisitor(): UseReturningVisitorReturn {
  const [isReturning, setIsReturning] = useState(() => {
    return localStorage.getItem(RETURNING_KEY) === 'true';
  });

  const [visitCount, setVisitCount] = useState(() => {
    return parseInt(localStorage.getItem(COUNT_KEY) ?? '0', 10);
  });

  const [lastVisit, setLastVisit] = useState<string | null>(() => {
    return localStorage.getItem(LAST_VISIT_KEY);
  });

  const markVisited = useCallback(() => {
    const now = new Date().toISOString();
    const prevCount = parseInt(localStorage.getItem(COUNT_KEY) ?? '0', 10);
    const newCount = prevCount + 1;

    localStorage.setItem(RETURNING_KEY, 'true');
    localStorage.setItem(COUNT_KEY, String(newCount));
    localStorage.setItem(LAST_VISIT_KEY, now);

    setIsReturning(true);
    setVisitCount(newCount);
    setLastVisit(now);
  }, []);

  useEffect(() => {
    markVisited();
  }, [markVisited]);

  const daysSinceLastVisit: number | null = (() => {
    if (!lastVisit) return null;
    const diff = Date.now() - new Date(lastVisit).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  })();

  return { isReturning, visitCount, lastVisit, daysSinceLastVisit, markVisited };
}
