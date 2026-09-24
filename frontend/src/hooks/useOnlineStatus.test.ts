import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus', () => {
  const originalOnLine = Object.getOwnPropertyDescriptor(navigator, 'onLine');

  const setNavigatorOnLine = (value: boolean) => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value,
    });
  };

  beforeEach(() => {
    setNavigatorOnLine(true);
  });

  afterEach(() => {
    if (originalOnLine) {
      Object.defineProperty(navigator, 'onLine', originalOnLine);
    }
  });

  it('initializes to true when navigator.onLine is true', () => {
    setNavigatorOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('initializes to false when navigator.onLine is false', () => {
    setNavigatorOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('updates to false when offline event fires', () => {
    setNavigatorOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });

  it('updates to true when online event fires', () => {
    setNavigatorOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });

  it('handles multiple online/offline transitions', () => {
    setNavigatorOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());

    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe(false);

    act(() => { window.dispatchEvent(new Event('online')); });
    expect(result.current).toBe(true);

    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe(false);
  });

  it('removes event listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOnlineStatus());

    expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('does not respond to events after unmount', () => {
    setNavigatorOnLine(true);
    const { result, unmount } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    unmount();

    // After unmount, dispatching events should not throw
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // result.current remains the last state (true) — no update after unmount
    expect(result.current).toBe(true);
  });
});
