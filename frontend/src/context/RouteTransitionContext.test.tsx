import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  RouteTransitionProvider,
  useRouteTransition,
} from './RouteTransitionContext';

describe('RouteTransitionContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteTransitionProvider>{children}</RouteTransitionProvider>
  );

  it('throws an error when useRouteTransition is used outside RouteTransitionProvider', () => {
    expect(() => renderHook(() => useRouteTransition())).toThrow(
      'useRouteTransition must be used inside <RouteTransitionProvider>',
    );
  });

  it('defaults isLoading to false', () => {
    const { result } = renderHook(() => useRouteTransition(), { wrapper });
    expect(result.current.isLoading).toBe(false);
  });

  it('updates isLoading when setIsLoading is called', () => {
    const { result } = renderHook(() => useRouteTransition(), { wrapper });

    act(() => {
      result.current.setIsLoading(true);
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setIsLoading(false);
    });
    expect(result.current.isLoading).toBe(false);
  });
});
