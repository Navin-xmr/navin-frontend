import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useWidgetRefresh from './useWidgetRefresh';

describe('useWidgetRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('starts with idle status', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useWidgetRefresh({ onRefresh }));
    expect(result.current.status).toBe('idle');
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.lastRefreshedAt).toBeNull();
  });

  it('status becomes refreshing during onRefresh', async () => {
    let resolveRefresh!: () => void;
    const onRefresh = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => { resolveRefresh = resolve; }),
    );

    const { result } = renderHook(() => useWidgetRefresh({ onRefresh }));

    act(() => {
      result.current.refresh();
    });

    expect(result.current.status).toBe('refreshing');
    expect(result.current.isRefreshing).toBe(true);

    await act(async () => {
      resolveRefresh();
      await Promise.resolve();
    });
  });

  it('status becomes success after onRefresh resolves', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useWidgetRefresh({ onRefresh }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.isRefreshing).toBe(false);
  });

  it('sets lastRefreshedAt after success', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useWidgetRefresh({ onRefresh }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.lastRefreshedAt).toBeInstanceOf(Date);
  });

  it('reverts to idle after successDisplayMs', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useWidgetRefresh({ onRefresh, successDisplayMs: 2000 }),
    );

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('success');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.status).toBe('idle');
  });

  it('does not revert to idle before successDisplayMs', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useWidgetRefresh({ onRefresh, successDisplayMs: 3000 }),
    );

    await act(async () => {
      await result.current.refresh();
    });

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(result.current.status).toBe('success');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.status).toBe('idle');
  });

  it('status becomes error when onRefresh throws', async () => {
    const onRefresh = vi.fn().mockRejectedValue(new Error('fetch failed'));
    const { result } = renderHook(() => useWidgetRefresh({ onRefresh }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isRefreshing).toBe(false);
  });

  it('lastRefreshedAt is not set when refresh fails', async () => {
    const onRefresh = vi.fn().mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useWidgetRefresh({ onRefresh }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.lastRefreshedAt).toBeNull();
  });

  it('auto-refreshes on interval when intervalMs > 0', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useWidgetRefresh({ onRefresh, intervalMs: 5000 }));

    // Allow first interval tick
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(onRefresh).toHaveBeenCalledTimes(2);
  });

  it('does NOT auto-refresh when intervalMs is 0 (default)', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useWidgetRefresh({ onRefresh, intervalMs: 0 }));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('clears interval on unmount', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() =>
      useWidgetRefresh({ onRefresh, intervalMs: 5000 }),
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('refresh() returns a promise', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useWidgetRefresh({ onRefresh }));

    const returnValue = result.current.refresh();
    expect(returnValue).toBeInstanceOf(Promise);
  });
});
