import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const TEST_KEY = 'navin-test-key';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('returns initialValue when no stored value exists', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'default'));

      expect(result.current.value).toBe('default');
    });

    it('returns initialValue for complex object types', () => {
      const initial = { name: 'test', count: 0 };
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, initial));

      expect(result.current.value).toEqual(initial);
    });

    it('reads and parses existing stored value from localStorage', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify('stored-value'));

      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'default'));

      expect(result.current.value).toBe('stored-value');
    });

    it('reads and parses stored object from localStorage', () => {
      const stored = { name: 'stored', count: 42 };
      localStorage.setItem(TEST_KEY, JSON.stringify(stored));

      const { result } = renderHook(() => useLocalStorage(TEST_KEY, { name: 'default', count: 0 }));

      expect(result.current.value).toEqual(stored);
    });
  });

  describe('corrupted JSON handling', () => {
    it('falls back to initialValue when stored JSON is corrupted', () => {
      localStorage.setItem(TEST_KEY, 'not-valid-json{{{');

      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'fallback'));

      expect(result.current.value).toBe('fallback');
    });

    it('falls back to initialValue for partial JSON', () => {
      localStorage.setItem(TEST_KEY, '{"incomplete":');

      const { result } = renderHook(() => useLocalStorage(TEST_KEY, { safe: true }));

      expect(result.current.value).toEqual({ safe: true });
    });
  });

  describe('setValue', () => {
    it('updates value directly and writes to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      act(() => {
        result.current.setValue('updated');
      });

      expect(result.current.value).toBe('updated');
      expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify('updated'));
    });

    it('updates object values and serializes correctly', () => {
      const { result } = renderHook(() =>
        useLocalStorage(TEST_KEY, { count: 0, name: 'a' }),
      );

      const next = { count: 5, name: 'b' };
      act(() => {
        result.current.setValue(next);
      });

      expect(result.current.value).toEqual(next);
      expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify(next));
    });

    it('supports functional updates based on previous value', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 0));

      act(() => {
        result.current.setValue((prev) => prev + 10);
      });

      expect(result.current.value).toBe(10);
      expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify(10));
    });

    it('chains multiple functional updates correctly', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 0));

      act(() => {
        result.current.setValue((prev) => prev + 1);
        result.current.setValue((prev) => prev * 2);
        result.current.setValue((prev) => prev + 3);
      });

      expect(result.current.value).toBe(5);
      expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify(5));
    });
  });

  describe('removeValue', () => {
    it('removes from localStorage and resets to initialValue', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify('old-value'));
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      expect(result.current.value).toBe('old-value');

      act(() => {
        result.current.removeValue();
      });

      expect(result.current.value).toBe('initial');
      expect(localStorage.getItem(TEST_KEY)).toBeNull();
    });

    it('works when no stored value exists', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      act(() => {
        result.current.removeValue();
      });

      expect(result.current.value).toBe('initial');
      expect(localStorage.getItem(TEST_KEY)).toBeNull();
    });
  });

  describe('storage events (cross-tab sync)', () => {
    it('updates value when storage event fires with same key', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      const newValue = 'from-another-tab';
      act(() => {
        const event = new StorageEvent('storage', {
          key: TEST_KEY,
          oldValue: JSON.stringify('initial'),
          newValue: JSON.stringify(newValue),
        });
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe(newValue);
    });

    it('resets to initialValue when storage event fires with null newValue (removed elsewhere)', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify('stored'));
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      expect(result.current.value).toBe('stored');

      act(() => {
        const event = new StorageEvent('storage', {
          key: TEST_KEY,
          oldValue: JSON.stringify('stored'),
          newValue: null,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('initial');
    });

    it('falls back to initialValue when storage event has corrupted JSON', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      act(() => {
        const event = new StorageEvent('storage', {
          key: TEST_KEY,
          oldValue: JSON.stringify('initial'),
          newValue: 'corrupted{{{',
        });
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('initial');
    });

    it('does not update when storage event fires with different key', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'other-key',
          oldValue: null,
          newValue: JSON.stringify('other-value'),
        });
        window.dispatchEvent(event);
      });

      expect(result.current.value).toBe('initial');
    });
  });

  describe('storage error handling', () => {
    it('setValue does not throw when localStorage.setItem throws', () => {
      const setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });

      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      expect(() => {
        act(() => {
          result.current.setValue('should-not-throw');
        });
      }).not.toThrow();

      expect(result.current.value).toBe('should-not-throw');

      setItemSpy.mockRestore();
    });

    it('removeValue does not throw when localStorage.removeItem throws', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify('stored'));
      const removeItemSpy = vi
        .spyOn(Storage.prototype, 'removeItem')
        .mockImplementation(() => {
          throw new Error('Access denied');
        });

      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

      expect(() => {
        act(() => {
          result.current.removeValue();
        });
      }).not.toThrow();

      expect(result.current.value).toBe('initial');

      removeItemSpy.mockRestore();
    });

    it('readValue does not throw when localStorage.getItem throws', () => {
      const getItemSpy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('SecurityError');
        });

      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'safe-default'));

      expect(result.current.value).toBe('safe-default');

      getItemSpy.mockRestore();
    });
  });
});
