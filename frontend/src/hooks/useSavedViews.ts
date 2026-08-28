import { useState, useCallback, useEffect } from 'react';
import type { SavedView } from '../types/savedView';

export interface UseSavedViewsReturn {
  views: SavedView[];
  save: (name: string, filters: Record<string, unknown>) => void;
  load: (id: string) => SavedView | undefined;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
}

const MAX_NAME_LENGTH = 50;

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function readFromStorage(key: string): SavedView[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedView[];
  } catch {
    return [];
  }
}

function writeToStorage(key: string, views: SavedView[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(views));
  } catch {
    // localStorage may be unavailable (private browsing quota exceeded, etc.)
  }
}

export function useSavedViews(storageKey = 'navin_saved_views'): UseSavedViewsReturn {
  const [views, setViews] = useState<SavedView[]>(() => readFromStorage(storageKey));

  // Persist to localStorage whenever views change
  useEffect(() => {
    writeToStorage(storageKey, views);
  }, [views, storageKey]);

  const save = useCallback(
    (name: string, filters: Record<string, unknown>) => {
      const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
      if (!trimmedName) return;

      const newView: SavedView = {
        id: generateId(),
        name: trimmedName,
        filters,
        createdAt: new Date().toISOString(),
      };

      setViews((prev) => [...prev, newView]);
    },
    [],
  );

  const load = useCallback(
    (id: string): SavedView | undefined => {
      return views.find((v) => v.id === id);
    },
    [views],
  );

  const rename = useCallback(
    (id: string, name: string) => {
      const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
      if (!trimmedName) return;

      setViews((prev) =>
        prev.map((v) => (v.id === id ? { ...v, name: trimmedName } : v)),
      );
    },
    [],
  );

  const remove = useCallback(
    (id: string) => {
      setViews((prev) => prev.filter((v) => v.id !== id));
    },
    [],
  );

  return { views, save, load, rename, remove };
}
