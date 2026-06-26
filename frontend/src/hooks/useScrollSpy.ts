import { useState, useEffect, useRef } from 'react';

/**
 * useScrollSpy
 *
 * Uses IntersectionObserver to track which section is currently in view.
 *
 * @param sectionIds - Array of element IDs to observe
 * @param options - IntersectionObserver options (rootMargin, threshold, etc.)
 * @returns The ID of the section currently considered "active"
 */
function useScrollSpy(
  sectionIds: string[],
  options?: IntersectionObserverInit,
): string {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;
    if (typeof IntersectionObserver === 'undefined') return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerOptions: IntersectionObserverInit = {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
      ...options,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const visible = entries.find((e) => e.isIntersecting);
      if (visible) {
        setActiveId(visible.target.id);
      }
    }, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sectionIds, options]);

  return activeId;
}

export { useScrollSpy };