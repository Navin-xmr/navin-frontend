import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(() => ({ pathname: '/dashboard' })),
}));

import { useLocation } from 'react-router-dom';
import useWidgetCache from './useWidgetCache';

const mockUseLocation = useLocation as ReturnType<typeof vi.fn>;

describe('useWidgetCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('starts with isLoading false and data null before microtask flushes', () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [] });
    const { result } = renderHook(() =>
      useWidgetCache('widget-init', fetcher, 30000),
    );
    // Before microtask runs, data is null and not loading yet
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches data on mount when cache is empty', async () => {
    const fetcher = vi.fn().mockResolvedValue({ total: 42 });
    const { result } = renderHook(() =>
      useWidgetCache('widget-fresh-1', fetcher, 30000),
    );

    await act(async () => {
      await Promise.resolve(); // flush queueMicrotask
      await Promise.resolve(); // flush pending promises
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ total: 42 });
    expect(result.current.isLoading).toBe(false);
  });

  it('sets lastUpdated after fetch', async () => {
    const fetcher = vi.fn().mockResolvedValue({ val: 1 });
    const { result } = renderHook(() =>
      useWidgetCache('widget-ludate-1', fetcher, 30000),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.lastUpdated).toBeTypeOf('number');
    expect(result.current.lastUpdated).toBeGreaterThan(0);
  });

  it('uses different cache keys for different routes', async () => {
    const fetcher1 = vi.fn().mockResolvedValue({ route: 'dashboard' });
    const fetcher2 = vi.fn().mockResolvedValue({ route: 'shipments' });

    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });
    const { result: r1 } = renderHook(() =>
      useWidgetCache('widget-route-key', fetcher1, 30000),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    mockUseLocation.mockReturnValue({ pathname: '/shipments' });
    const { result: r2 } = renderHook(() =>
      useWidgetCache('widget-route-key', fetcher2, 30000),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(r1.current.data).toEqual({ route: 'dashboard' });
    expect(r2.current.data).toEqual({ route: 'shipments' });
  });

  it('refresh() deletes cache entry and re-fetches', async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(() => {
      callCount += 1;
      return Promise.resolve({ count: callCount });
    });

    const { result } = renderHook(() =>
      useWidgetCache('widget-refresh-1', fetcher, 30000),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.data).toEqual({ count: 1 });

    await act(async () => {
      result.current.refresh();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual({ count: 2 });
  });

  it('isStale is false for fresh cache', async () => {
    const fetcher = vi.fn().mockResolvedValue({ fresh: true });
    const { result } = renderHook(() =>
      useWidgetCache('widget-fresh-stale-1', fetcher, 30000),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.isStale).toBe(false);
  });

  it('re-fetches and marks isStale when cache is expired', async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(() => {
      callCount += 1;
      return Promise.resolve({ version: callCount });
    });

    // First render — populates cache
    const { result: r1, unmount: unmount1 } = renderHook(() =>
      useWidgetCache('widget-stale-ttl', fetcher, 100),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(r1.current.data).toEqual({ version: 1 });
    unmount1();

    // Advance time past TTL
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Second render — cache is stale, should re-fetch
    const { result: r2 } = renderHook(() =>
      useWidgetCache('widget-stale-ttl', fetcher, 100),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(r2.current.data).toEqual({ version: 2 });
  });

  it('returns isLoading true during fetch', async () => {
    let resolvePromise!: (value: { done: boolean }) => void;
    const fetcher = vi.fn().mockImplementation(
      () => new Promise<{ done: boolean }>((resolve) => { resolvePromise = resolve; }),
    );

    const { result } = renderHook(() =>
      useWidgetCache('widget-loading-1', fetcher, 30000),
    );

    await act(async () => {
      await Promise.resolve(); // flush microtask to start fetch
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise({ done: true });
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual({ done: true });
  });
});
