import { useState, useCallback } from 'react';

/**
 * A type-safe, generic hook that syncs a value to `window.localStorage`.
 *
 * @param key          - The localStorage key to read/write.
 * @param initialValue - Fallback used when the key is absent or the stored
 *                       JSON cannot be parsed.
 * @returns A readonly tuple of `[storedValue, setValue, removeValue]`.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Lazy initialiser — reads from storage exactly once on mount.
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR guard: window may not exist in server-side environments.
    if (typeof window === 'undefined') return initialValue;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw) as T;
    } catch {
      // Corrupted / invalid JSON — fall back silently.
      return initialValue;
    }
  });

  /**
   * Persist a new value (or the result of an updater function) to
   * localStorage and update React state so consumers re-render.
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(next));
          } catch (error) {
            console.error(`useLocalStorage: failed to write key "${key}"`, error);
          }
        }

        return next;
      });
    },
    [key],
  );

  /**
   * Remove the key from localStorage and reset state to `initialValue`.
   * Resets to `initialValue`, never to `null`.
   */
  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Storage unavailable — still reset React state below.
      }
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
