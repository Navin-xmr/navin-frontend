import { useCallback, useState } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  /**
   * Serialised filter/search state. Whenever it changes the page snaps back to
   * page 1, so a new filter never leaves the user on an out-of-range page.
   */
  resetKey?: string | number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  reset: () => void;
  getOffset: () => number;
}

export function usePagination(options?: UsePaginationOptions): UsePaginationReturn {
  const initialPage = options?.initialPage ?? 1;
  const pageSize = options?.pageSize ?? 10;

  const [currentPage, setCurrentPage] = useState(initialPage);

  // Filter support: restart from the first page when the filters change.
  // Adjusting state during render (instead of in an effect) avoids a render
  // — and a server request — for the new filters on the old page.
  const resetKey = options?.resetKey;
  const [previousResetKey, setPreviousResetKey] = useState(resetKey);
  if (previousResetKey !== resetKey) {
    setPreviousResetKey(resetKey);
    setCurrentPage(1);
  }

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const getOffset = useCallback(() => (currentPage - 1) * pageSize, [currentPage, pageSize]);

  return { currentPage, pageSize, setPage, reset, getOffset };
}
