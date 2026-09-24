import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const TEST_KEY = 'test-key';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns initialValue when nothing is in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('supports lazy initial value function', () => {
    const lazyFn = vi.fn(() => 42);
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, lazyFn));
    expect(result.current[0]).toBe(42);
    expect(lazyFn).toHaveBeenCalledTimes(1);
  });

  it('reads pre-existing serialized JSON value from localStorage', () => {
    const userObj = { id: 'usr_1', role: 'admin' };
    localStorage.setItem(TEST_KEY, JSON.stringify(userObj));

    const { result } = renderHook(() =>
      useLocalStorage<{ id: string; role: string }>(TEST_KEY, { id: '', role: '' }),
    );

    expect(result.current[0]).toEqual(userObj);
  });

  it('updates state and persists JSON to localStorage on setValue', () => {
    const { result } = renderHook(() => useLocalStorage<{ count: number }>(TEST_KEY, { count: 0 }));

    act(() => {
      result.current[1]({ count: 5 });
    });

    expect(result.current[0]).toEqual({ count: 5 });
    expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify({ count: 5 }));
  });

  it('supports functional updates with setValue', () => {
    const { result } = renderHook(() => useLocalStorage<number>(TEST_KEY, 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(localStorage.getItem(TEST_KEY)).toBe('15');
  });

  it('removes item from localStorage and resets state to initialValue on removeValue', () => {
    localStorage.setItem(TEST_KEY, JSON.stringify('stored_data'));
    const { result } = renderHook(() => useLocalStorage<string>(TEST_KEY, 'fallback'));

    expect(result.current[0]).toBe('stored_data');

    act(() => {
      result.current[2]();
    });

    expect(localStorage.getItem(TEST_KEY)).toBeNull();
    expect(result.current[0]).toBe('fallback');
  });

  it('gracefully recovers from corrupted or invalid JSON by returning initialValue', () => {
    localStorage.setItem(TEST_KEY, '{ invalid json: broken syntax');

    const { result } = renderHook(() => useLocalStorage<string>(TEST_KEY, 'safe-default'));

    expect(result.current[0]).toBe('safe-default');
  });

  it('supports raw mode without JSON serialization', () => {
    localStorage.setItem(TEST_KEY, 'raw-text-value');

    const { result } = renderHook(() =>
      useLocalStorage<string>(TEST_KEY, 'default', { raw: true }),
    );

    expect(result.current[0]).toBe('raw-text-value');

    act(() => {
      result.current[1]('updated-raw-value');
    });

    expect(localStorage.getItem(TEST_KEY)).toBe('updated-raw-value');
    expect(result.current[0]).toBe('updated-raw-value');
  });

  it('updates state when a storage event is dispatched from another tab', () => {
    const { result } = renderHook(() => useLocalStorage<{ status: string }>(TEST_KEY, { status: 'idle' }));

    expect(result.current[0]).toEqual({ status: 'idle' });

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: TEST_KEY,
          newValue: JSON.stringify({ status: 'active' }),
          storageArea: localStorage,
        }),
      );
    });

    expect(result.current[0]).toEqual({ status: 'active' });
  });

  it('resets to initialValue when a storage event indicates item was removed', () => {
    localStorage.setItem(TEST_KEY, JSON.stringify('existing'));
    const { result } = renderHook(() => useLocalStorage<string>(TEST_KEY, 'default'));

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: TEST_KEY,
          newValue: null,
          storageArea: localStorage,
        }),
      );
    });

    expect(result.current[0]).toBe('default');
  });

  it('logs an error and does not throw when localStorage write fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useLocalStorage<string>(TEST_KEY, 'initial'));

    expect(() => {
      act(() => {
        result.current[1]('new-value');
      });
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      `useLocalStorage: failed to write key "${TEST_KEY}"`,
      expect.any(Error),
    );
  });
});
