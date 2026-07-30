import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

// setup.ts replaces window.localStorage with a fresh in-memory store per test
// file, but we still clear it between individual tests for isolation.
beforeEach(() => {
  window.localStorage.clear();
});

describe('useLocalStorage', () => {
  // -------------------------------------------------------------------------
  // Initial value
  // -------------------------------------------------------------------------
  describe('initial value', () => {
    it('returns initialValue when the key is absent', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 42));
      const [storedValue] = result.current;
      expect(storedValue).toBe(42);
    });

    it('returns the value already in storage instead of initialValue', () => {
      window.localStorage.setItem('test-key', JSON.stringify('hello'));
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      const [storedValue] = result.current;
      expect(storedValue).toBe('hello');
    });

    it('works with object types stored in localStorage', () => {
      const persisted = { name: 'Alice', age: 30 };
      window.localStorage.setItem('obj-key', JSON.stringify(persisted));
      const { result } = renderHook(() =>
        useLocalStorage('obj-key', { name: '', age: 0 }),
      );
      expect(result.current[0]).toEqual(persisted);
    });
  });

  // -------------------------------------------------------------------------
  // Writing a new value
  // -------------------------------------------------------------------------
  describe('setValue', () => {
    it('updates state with a direct value', () => {
      const { result } = renderHook(() => useLocalStorage('count', 0));

      act(() => {
        result.current[1](99);
      });

      expect(result.current[0]).toBe(99);
      expect(JSON.parse(window.localStorage.getItem('count') ?? 'null')).toBe(99);
    });

    it('updates state with an updater function', () => {
      const { result } = renderHook(() => useLocalStorage('count', 10));

      act(() => {
        result.current[1]((prev) => prev + 5);
      });

      expect(result.current[0]).toBe(15);
      expect(JSON.parse(window.localStorage.getItem('count') ?? 'null')).toBe(15);
    });

    it('serialises objects to JSON in localStorage', () => {
      const { result } = renderHook(() =>
        useLocalStorage<{ flag: boolean }>('obj', { flag: false }),
      );

      act(() => {
        result.current[1]({ flag: true });
      });

      expect(result.current[0]).toEqual({ flag: true });
      expect(JSON.parse(window.localStorage.getItem('obj') ?? '{}')).toEqual({ flag: true });
    });
  });

  // -------------------------------------------------------------------------
  // Removing a value
  // -------------------------------------------------------------------------
  describe('removeValue', () => {
    it('clears the key from localStorage', () => {
      window.localStorage.setItem('theme', JSON.stringify('dark'));
      const { result } = renderHook(() => useLocalStorage('theme', 'light'));

      act(() => {
        result.current[2](); // removeValue
      });

      expect(window.localStorage.getItem('theme')).toBeNull();
    });

    it('resets state to initialValue (not null)', () => {
      const { result } = renderHook(() => useLocalStorage('theme', 'light'));

      // First write something
      act(() => {
        result.current[1]('dark');
      });
      expect(result.current[0]).toBe('dark');

      // Then remove it
      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toBe('light');
    });
  });

  // -------------------------------------------------------------------------
  // Corrupted / invalid JSON
  // -------------------------------------------------------------------------
  describe('corrupted JSON recovery', () => {
    it('falls back to initialValue when stored data is not valid JSON', () => {
      window.localStorage.setItem('corrupt', 'not-valid-json{{{');
      const { result } = renderHook(() => useLocalStorage('corrupt', 'fallback'));
      expect(result.current[0]).toBe('fallback');
    });

    it('does not throw when stored data is corrupted', () => {
      window.localStorage.setItem('corrupt2', '!!invalid!!');
      expect(() =>
        renderHook(() => useLocalStorage('corrupt2', 0)),
      ).not.toThrow();
    });
  });
});
