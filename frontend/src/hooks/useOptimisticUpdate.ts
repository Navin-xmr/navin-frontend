import { useCallback, useRef, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useLiveRegion } from "../context/LiveRegionContext";

/**
 * A reusable hook for optimistic UI updates with automatic rollback on failure.
 *
 * Usage:
 *   const { mutate, isMutating } = useOptimisticUpdate({
 *     onMutate: async () => { /* call API *\/ },
 *     onRollback: (snapshot) => { /* revert state to snapshot *\/ },
 *     successMessage: 'Status updated successfully',
 *     errorMessage: 'Failed to update status',
 *   });
 *
 *   mutate(snapshotValue);
 */
export function useOptimisticUpdate<T>({
  onMutate,
  onRollback,
  successMessage,
  errorMessage,
}: {
  onMutate: () => Promise<unknown>;
  onRollback: (snapshot: T) => void;
  successMessage?: string;
  errorMessage?: string;
}) {
  const [isMutating, setIsMutating] = useState(false);
  const { addToast } = useToast();
  const { announce } = useLiveRegion();
  const snapshotRef = useRef<T | null>(null);

  const mutate = useCallback(
    async (snapshot: T) => {
      // Store snapshot for rollback
      snapshotRef.current = snapshot;

      setIsMutating(true);

      try {
        // Apply optimistic update (caller should have already updated state)
        await onMutate();

        if (successMessage) {
          addToast(successMessage, "success");
          announce(successMessage, "polite");
        }
      } catch {
        // Rollback to snapshot
        if (snapshotRef.current !== null) {
          onRollback(snapshotRef.current);
        }

        const msg =
          errorMessage ?? "Operation failed. Changes have been reverted.";
        addToast(msg, "error");
        announce(msg, "assertive");
      } finally {
        snapshotRef.current = null;
        setIsMutating(false);
      }
    },
    [onMutate, onRollback, successMessage, errorMessage, addToast, announce],
  );

  return { mutate, isMutating };
}
