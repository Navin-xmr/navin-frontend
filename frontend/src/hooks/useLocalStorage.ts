import { useCallback, useEffect, useState } from 'react';

export type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: SetValue<T>;
  removeValue: () => void;
}

function isFunction<T>(value: T | ((prevValue: T) => T)): value is (prevValue: T) => T {
  return typeof value === 'function';
}

function readValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return initialValue;
    }
    return JSON.parse(item) as T;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturn<T> {
  const [value, setValueState] = useState<T>(() => readValue(key, initialValue));

  const setValue: SetValue<T> = useCallback(
    (val) => {
      setValueState((prev) => {
        const newValue = isFunction(val) ? val(prev) : val;

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } catch {
            // Silently ignore storage errors (e.g. quota exceeded, private mode)
          }
        }

        return newValue;
      });
    },
    [key],
  );

  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Silently ignore storage errors
      }
    }
    setValueState(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key) {
        return;
      }

      if (e.newValue === null) {
        setValueState(initialValue);
        return;
      }

      try {
        setValueState(JSON.parse(e.newValue) as T);
      } catch {
        setValueState(initialValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, initialValue]);

  return { value, setValue, removeValue };
}
