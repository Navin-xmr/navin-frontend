import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

// setup.ts installs a fresh in-memory localStorage for the whole test file;
// we clear it between individual tests for isolation.
beforeEach(() => {
  window.localStorage.clear();
});

describe('useLocalStorage', () => {
  // ── Initial value ────────────────────────────────────────────────────────

  describe('initial value', () => {
    it('returns initialValue when the key is absent', () => {
      const { result } = renderHook(() => useLocalStorage('missing-key', 42));
      expect(result.current[0]).toBe(42);
    });

    it('returns the value already stored instead of initialValue', () => {
      window.localStorage.setItem('theme', JSON.stringify('dark'));
      const { result } = renderHook(() => useLocalStorage('theme', 'light'));
      expect(result.current[0]).toBe('dark');
    });

    it('works with object types', () => {
      const stored = { name: 'Alice', role: 'admin' };
      window.localStorage.setItem('user', JSON.stringify(stored));
      const { result } = renderHook(() =>
        useLocalStorage('user', { name: '', role: '' }),
      );
      expect(result.current[0]).toEqual(stored);
    });

    it('works with array types', () => {
      window.localStorage.setItem('ids', JSON.stringify([1, 2, 3]));
      const { result } = renderHook(() => useLocalStorage<number[]>('ids', []));
      expect(result.current[0]).toEqual([1, 2, 3]);
    });
  });

  // ── Writing a new value ───────────────────────────────────────────────────

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

    it('serialises objects correctly to localStorage', () => {
      const { result } = renderHook(() =>
        useLocalStorage<{ active: boolean }>('prefs', { active: false }),
      );

      act(() => {
        result.current[1]({ active: true });
      });

      expect(result.current[0]).toEqual({ active: true });
      expect(JSON.parse(window.localStorage.getItem('prefs') ?? '{}')).toEqual({
        active: true,
      });
    });

    it('supports chained updater calls', () => {
      const { result } = renderHook(() => useLocalStorage('count', 0));

      act(() => {
        result.current[1]((p) => p + 1);
      });
      act(() => {
        result.current[1]((p) => p + 1);
      });

      expect(result.current[0]).toBe(2);
    });
  });

  // ── Removing a value ──────────────────────────────────────────────────────

  describe('removeValue', () => {
    it('removes the key from localStorage', () => {
      window.localStorage.setItem('token', JSON.stringify('abc123'));
      const { result } = renderHook(() => useLocalStorage('token', ''));

      act(() => {
        result.current[2]();
      });

      expect(window.localStorage.getItem('token')).toBeNull();
    });

    it('resets state to initialValue (not null)', () => {
      const { result } = renderHook(() => useLocalStorage('count', 0));

      act(() => {
        result.current[1](42);
      });
      expect(result.current[0]).toBe(42);

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toBe(0);
    });

    it('resets to initialValue even when key was never set', () => {
      const { result } = renderHook(() => useLocalStorage('noop', 'default'));

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toBe('default');
    });
  });

  // ── Corrupted JSON recovery ───────────────────────────────────────────────

  describe('corrupted JSON recovery', () => {
    it('falls back to initialValue when stored data is not valid JSON', () => {
      window.localStorage.setItem('bad', 'not-valid-{{{');
      const { result } = renderHook(() => useLocalStorage('bad', 'fallback'));
      expect(result.current[0]).toBe('fallback');
    });

    it('does not throw when stored data is corrupted', () => {
      window.localStorage.setItem('bad2', '!!invalid!!');
      expect(() =>
        renderHook(() => useLocalStorage('bad2', 0)),
      ).not.toThrow();
    });

    it('returns initialValue for a null-stored item', () => {
      // localStorage.getItem returns null when absent
      const { result } = renderHook(() =>
        useLocalStorage<string[]>('empty', ['default']),
      );
      expect(result.current[0]).toEqual(['default']);
    });
  });

  // ── Return shape ──────────────────────────────────────────────────────────

  describe('return type', () => {
    it('returns a tuple of [value, setter, remover]', () => {
      const { result } = renderHook(() => useLocalStorage('x', 0));
      const [value, setValue, removeValue] = result.current;

      expect(typeof value).toBe('number');
      expect(typeof setValue).toBe('function');
      expect(typeof removeValue).toBe('function');
    });
  });
});
