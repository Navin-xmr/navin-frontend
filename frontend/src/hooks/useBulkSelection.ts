import { useState, useCallback, useEffect } from 'react';

const SESSION_KEY = 'shipments-bulk-selection';

export interface UseBulkSelectionReturn {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleOne: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  clearSelection: () => void;
  selectedCount: number;
}

export function useBulkSelection(): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Persist to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...selectedIds]));
    } catch {
      // ignore
    }
  }, [selectedIds]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...ids]);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return { selectedIds, isSelected, toggleOne, toggleAll, clearSelection, selectedCount: selectedIds.size };
}
