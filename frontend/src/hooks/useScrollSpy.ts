import { useState, useEffect } from 'react';

/**
 * useScrollSpy
 *
 * Uses IntersectionObserver to track which section is currently in view.
 *
 * @param sectionIds - Array of element IDs to observe
 * @param rootMargin - IntersectionObserver rootMargin (default centres a band in the viewport)
 * @returns The ID of the section currently considered "active", or null
 */
function useScrollSpy(
  sectionIds: string[],
  rootMargin = '-40% 0px -55% 0px',
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, rootMargin]);

  return activeId;
}

export { useScrollSpy };
