import { useCallback, useState } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
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

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const getOffset = useCallback(() => (currentPage - 1) * pageSize, [currentPage, pageSize]);

  return { currentPage, pageSize, setPage, reset, getOffset };
}
