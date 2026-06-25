import { useEffect, useCallback, RefObject } from 'react';

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside the given container element while active.
 *
 * - On activation: saves the previously-focused element and moves focus to the
 *   first focusable element inside the container (or the container itself).
 * - Tab / Shift+Tab: wraps focus at the boundaries of the container.
 * - Escape: calls onEscape if provided.
 * - On deactivation: restores focus to the previously-focused element.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void
): void {
  const getFocusable = useCallback((): HTMLElement[] => {
    if (!ref.current) return [];
    return Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
  }, [ref]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [getFocusable, onEscape]
  );

  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', handleKeyDown);

    const raf = requestAnimationFrame(() => {
      const focusable = getFocusable();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        ref.current?.focus();
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, handleKeyDown, getFocusable, ref]);
}

export default useFocusTrap;
