import { useCallback, useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseFormAutosaveOptions<T> {
  /** Storage key – scoped to the multi-step form (e.g. "create-shipment"). */
  storageKey: string;
  /** Current form data to persist. */
  data: T;
  /** How many ms after the last change to wait before saving. Defaults to 1500. */
  debounceMs?: number;
  /** Called after a successful save (optional side-effect hook). */
  onSave?: (data: T) => void;
}

export interface UseFormAutosaveReturn<T> {
  /** Current autosave status. */
  status: AutosaveStatus;
  /** Timestamp of last successful save, or null. */
  lastSavedAt: Date | null;
  /** Load previously autosaved data for this key, or null if none. */
  loadDraft: () => T | null;
  /** Manually clear the saved draft. */
  clearDraft: () => void;
  /** Imperatively trigger a save immediately (bypasses debounce). */
  saveNow: () => void;
}

/**
 * useFormAutosave
 *
 * Persists multi-step form state to localStorage with debouncing.
 * Shows real-time autosave status so users can navigate between steps
 * without fear of losing progress.
 *
 * @example
 * const { status, lastSavedAt, loadDraft, clearDraft } = useFormAutosave({
 *   storageKey: 'create-shipment',
 *   data: formValues,
 * });
 */
function useFormAutosave<T>({
  storageKey,
  data,
  debounceMs = 1500,
  onSave,
}: UseFormAutosaveOptions<T>): UseFormAutosaveReturn<T> {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<T>(data);
  const isMountedRef = useRef(false);

  // Keep the ref up to date so saveNow always uses the latest data
  dataRef.current = data;

  const persistData = useCallback(() => {
    setStatus('saving');
    try {
      localStorage.setItem(storageKey, JSON.stringify(dataRef.current));
      const now = new Date();
      setLastSavedAt(now);
      setStatus('saved');
      onSave?.(dataRef.current);
    } catch {
      setStatus('error');
    }
  }, [storageKey, onSave]);

  // Debounced autosave on data change (skip initial mount)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    setStatus('saving');

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      persistData();
    }, debounceMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, debounceMs]);

  const loadDraft = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setStatus('idle');
    setLastSavedAt(null);
  }, [storageKey]);

  const saveNow = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    persistData();
  }, [persistData]);

  return { status, lastSavedAt, loadDraft, clearDraft, saveNow };
}

export default useFormAutosave;
