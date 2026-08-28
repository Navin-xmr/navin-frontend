import { useCallback, useEffect, useRef, useState } from 'react';

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseFormAutosaveOptions {
  key: string;
  debounceMs?: number;
}

interface UseFormAutosaveReturn {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  loadDraft: <T>() => T | null;
  clearDraft: () => void;
  saveNow: <T>(data: T) => void;
}

export function useFormAutosave(
  data: unknown,
  { key, debounceMs = 1500 }: UseFormAutosaveOptions,
): UseFormAutosaveReturn {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const isMountedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (payload: unknown) => {
      try {
        setStatus('saving');
        localStorage.setItem(key, JSON.stringify({ data: payload, savedAt: new Date().toISOString() }));
        const now = new Date();
        setLastSavedAt(now);
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    },
    [key],
  );

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      persist(data);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, debounceMs, persist]);

  const saveNow = useCallback(
    <T>(payload: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      persist(payload);
    },
    [persist],
  );

  const loadDraft = useCallback(<T>(): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data: T };
      return parsed.data;
    } catch {
      return null;
    }
  }, [key]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setStatus('idle');
    setLastSavedAt(null);
  }, [key]);

  return { status, lastSavedAt, loadDraft, clearDraft, saveNow };
}
