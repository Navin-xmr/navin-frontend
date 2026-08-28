import { useCallback, useEffect, useRef, useState } from 'react';

// === Types

export interface FormDraft<T> {
  values: T;
  savedAt: string;
}

export interface UseFormDraftReturn<T> {
  /** Draft found in storage on mount, null when there is nothing to recover */
  draft: FormDraft<T> | null;
  /** Timestamp of the most recent autosave, null before the first one */
  lastSavedAt: Date | null;
  /** Apply the recovered draft and clear the recovery prompt */
  restoreDraft: () => T | null;
  /** Drop the recovered draft without applying it */
  discardDraft: () => void;
  /** Remove the stored draft, e.g. after a successful submit */
  clearDraft: () => void;
}

interface UseFormDraftOptions {
  /** Debounce before writing to storage, in ms */
  debounceMs?: number;
  /** Skip autosaving while true, e.g. during submission */
  disabled?: boolean;
}

// === Hook

/**
 * Autosaves a form's values to localStorage and exposes any draft left over
 * from a previous visit so the user can recover partially completed work.
 */
export function useFormDraft<T extends object>(
  storageKey: string,
  values: T,
  isEmpty: (values: T) => boolean,
  options: UseFormDraftOptions = {},
): UseFormDraftReturn<T> {
  const { debounceMs = 800, disabled = false } = options;

  const [draft, setDraft] = useState<FormDraft<T> | null>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return null;
      const candidate = parsed as Partial<FormDraft<T>>;
      if (!candidate.values || typeof candidate.savedAt !== 'string') return null;
      return { values: candidate.values as T, savedAt: candidate.savedAt };
    } catch {
      return null;
    }
  });
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Never autosave over a draft the user has not answered the prompt for yet
  const hasPendingDraft = useRef<boolean>(draft !== null);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // storage unavailable, nothing to clear
    }
    setLastSavedAt(null);
  }, [storageKey]);

  const restoreDraft = useCallback((): T | null => {
    if (!draft) return null;
    const restored = draft.values;
    hasPendingDraft.current = false;
    setDraft(null);
    return restored;
  }, [draft]);

  const discardDraft = useCallback(() => {
    hasPendingDraft.current = false;
    setDraft(null);
    clearDraft();
  }, [clearDraft]);

  useEffect(() => {
    if (disabled || hasPendingDraft.current) return;

    if (isEmpty(values)) {
      // Defer out of the effect body so the setState inside clearDraft()
      // isn't called synchronously during the effect.
      queueMicrotask(() => clearDraft());
      return;
    }

    const timer = setTimeout(() => {
      const savedAt = new Date();
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ values, savedAt: savedAt.toISOString() }),
        );
        setLastSavedAt(savedAt);
      } catch {
        // quota or private mode, autosave is best-effort
      }
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, disabled, storageKey, debounceMs]);

  return { draft, lastSavedAt, restoreDraft, discardDraft, clearDraft };
}
