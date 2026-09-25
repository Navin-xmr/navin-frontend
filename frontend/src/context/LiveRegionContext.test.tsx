import React from 'react';
import { screen, act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveRegionProvider, useLiveRegion } from './LiveRegionContext';

describe('LiveRegionContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LiveRegionProvider>{children}</LiveRegionProvider>
  );

  it('throws when useLiveRegion is used outside LiveRegionProvider', () => {
    expect(() => renderHook(() => useLiveRegion())).toThrow(
      'useLiveRegion must be used within a LiveRegionProvider',
    );
  });

  it('announces polite messages by default', () => {
    const { result } = renderHook(() => useLiveRegion(), { wrapper });

    act(() => {
      result.current.announce('Operation succeeded');
      vi.runAllTimers();
    });

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveTextContent('Operation succeeded');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');

    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toHaveTextContent('');
  });

  it('announces assertive messages when specified', () => {
    const { result } = renderHook(() => useLiveRegion(), { wrapper });

    act(() => {
      result.current.announce('Critical network error', 'assertive');
      vi.runAllTimers();
    });

    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toHaveTextContent('Critical network error');
    expect(alertRegion).toHaveAttribute('aria-live', 'assertive');

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveTextContent('');
  });

  it('clears announced messages after the 7-second timer expires', () => {
    const { result } = renderHook(() => useLiveRegion(), { wrapper });

    act(() => {
      result.current.announce('Temporary status message');
      vi.advanceTimersByTime(100);
    });

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveTextContent('Temporary status message');

    act(() => {
      vi.advanceTimersByTime(7000);
    });

    expect(statusRegion).toHaveTextContent('');
  });

  it('cancels previous clear timer when new announcement arrives', () => {
    const { result } = renderHook(() => useLiveRegion(), { wrapper });

    act(() => {
      result.current.announce('First message');
      vi.advanceTimersByTime(4000);
    });

    act(() => {
      result.current.announce('Second message');
      vi.advanceTimersByTime(4000);
    });

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveTextContent('Second message');

    act(() => {
      vi.advanceTimersByTime(3100);
    });

    expect(statusRegion).toHaveTextContent('');
  });
});
