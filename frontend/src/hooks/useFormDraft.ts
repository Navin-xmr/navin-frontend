import { useCallback, useEffect, useRef, useState } from 'react';

interface DraftEntry<T> {
  values: T;
  savedAt: string;
}

interface UseFormDraftOptions<T> {
  key: string;
  values: T;
  debounceMs?: number;
  disabled?: boolean;
  isEmpty?: (values: T) => boolean;
}

interface UseFormDraftReturn<T> {
  draft: DraftEntry<T> | null;
  lastSavedAt: Date | null;
  restoreDraft: () => T | null;
  discardDraft: () => void;
  clearDraft: () => void;
}

export function useFormDraft<T>({
  key,
  values,
  debounceMs = 800,
  disabled = false,
  isEmpty,
}: UseFormDraftOptions<T>): UseFormDraftReturn<T> {
  const [draft, setDraft] = useState<DraftEntry<T> | null>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as DraftEntry<T>;
    } catch {
      return null;
    }
  });

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const hasPendingDraft = useRef<boolean>(draft !== null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setDraft(null);
    setLastSavedAt(null);
  }, [key]);

  useEffect(() => {
    if (disabled) return;
    if (hasPendingDraft.current) return;
    if (isEmpty && isEmpty(values)) {
      queueMicrotask(() => clearDraft());
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const entry: DraftEntry<T> = { values, savedAt: new Date().toISOString() };
      try {
        localStorage.setItem(key, JSON.stringify(entry));
        setDraft(entry);
        setLastSavedAt(new Date());
      } catch {
        // ignore storage errors
      }
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [values, debounceMs, disabled, isEmpty, key, clearDraft]);

  const restoreDraft = useCallback((): T | null => {
    if (!draft) return null;
    const values = draft.values;
    setDraft(null);
    hasPendingDraft.current = false;
    return values;
  }, [draft]);

  const discardDraft = useCallback(() => {
    hasPendingDraft.current = false;
    clearDraft();
  }, [clearDraft]);

  return { draft, lastSavedAt, restoreDraft, discardDraft, clearDraft };
}
