import { useCallback, useEffect, useState } from 'react';

export interface UseLocalStorageOptions {
  raw?: boolean;
}

/**
 * Type-safe custom hook for interacting with window.localStorage.
 * Features:
 * - Full TypeScript generics (no `any`)
 * - Graceful fallback on JSON parse errors or corrupted storage
 * - Centralized quota error handling
 * - Multi-tab synchronization via window 'storage' events
 * - Functional updates support: setValue(prev => ...)
 * - Resets to initialValue on removeValue()
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options?: UseLocalStorageOptions,
): readonly [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const resolveInitial = useCallback((): T => {
    return initialValue instanceof Function ? (initialValue as () => T)() : initialValue;
  }, [initialValue]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return resolveInitial();
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return resolveInitial();
      }
      if (options?.raw) {
        return item as unknown as T;
      }
      return JSON.parse(item) as T;
    } catch {
      return resolveInitial();
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== 'undefined') {
            if (options?.raw) {
              window.localStorage.setItem(key, String(valueToStore));
            } else {
              window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
          }
          return valueToStore;
        });
      } catch (error) {
        console.error(`useLocalStorage: failed to write key "${key}"`, error);
      }
    },
    [key, options?.raw],
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`useLocalStorage: failed to remove key "${key}"`, error);
    }
    setStoredValue(resolveInitial());
  }, [key, resolveInitial]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.storageArea && e.storageArea !== window.localStorage) return;

      try {
        if (e.newValue === null) {
          setStoredValue(resolveInitial());
        } else {
          const parsed = options?.raw
            ? (e.newValue as unknown as T)
            : (JSON.parse(e.newValue) as T);
          setStoredValue(parsed);
        }
      } catch {
        setStoredValue(resolveInitial());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, options?.raw, resolveInitial]);

  return [storedValue, setValue, removeValue] as const;
}

export default useLocalStorage;
