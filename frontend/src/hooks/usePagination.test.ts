import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('defaults to page 1 with pageSize 10', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('setPage updates currentPage', () => {
    const { result } = renderHook(() => usePagination());

    act(() => result.current.setPage(3));

    expect(result.current.currentPage).toBe(3);
  });

  it('reset returns currentPage to 1', () => {
    const { result } = renderHook(() => usePagination());

    act(() => result.current.setPage(5));
    expect(result.current.currentPage).toBe(5);

    act(() => result.current.reset());

    expect(result.current.currentPage).toBe(1);
  });

  it('getOffset returns (currentPage - 1) * pageSize', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 8 }));

    expect(result.current.getOffset()).toBe(0);

    act(() => result.current.setPage(3));

    expect(result.current.getOffset()).toBe(16);
  });

  it('respects custom initialPage and pageSize options', () => {
    const { result } = renderHook(() => usePagination({ initialPage: 4, pageSize: 25 }));

    expect(result.current.currentPage).toBe(4);
    expect(result.current.pageSize).toBe(25);
  });
});
