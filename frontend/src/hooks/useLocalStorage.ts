import { useCallback, useEffect, useRef, useState } from 'react';

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
  const raw = options?.raw ?? false;

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
      if (raw) {
        return item as unknown as T;
      }
      return JSON.parse(item) as T;
    } catch {
      return resolveInitial();
    }
  });

  // Latest value, so functional updates can be resolved here rather than inside
  // a state updater: React runs updaters during render, where a storage error
  // (e.g. quota exceeded) would escape the try/catch below.
  const latestValueRef = useRef(storedValue);
  useEffect(() => {
    latestValueRef.current = storedValue;
  }, [storedValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const valueToStore = value instanceof Function ? value(latestValueRef.current) : value;
      latestValueRef.current = valueToStore;
      setStoredValue(valueToStore);

      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(
          key,
          raw ? String(valueToStore) : JSON.stringify(valueToStore),
        );
      } catch (error) {
        console.error(`useLocalStorage: failed to write key "${key}"`, error);
      }
    },
    [key, raw],
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
          const parsed = raw ? (e.newValue as unknown as T) : (JSON.parse(e.newValue) as T);
          setStoredValue(parsed);
        }
      } catch {
        setStoredValue(resolveInitial());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, raw, resolveInitial]);

  return [storedValue, setValue, removeValue] as const;
}

export default useLocalStorage;
