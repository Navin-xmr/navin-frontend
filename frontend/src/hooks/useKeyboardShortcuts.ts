import { useEffect } from 'react';

export interface ShortcutDef {
  key: string;
  alt?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  callback: () => void;
  label: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutDef[]): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      for (const s of shortcuts) {
        if (
          e.key.toLowerCase() === s.key.toLowerCase() &&
          !!e.altKey === !!s.alt &&
          !!e.ctrlKey === !!s.ctrl &&
          !!e.shiftKey === !!s.shift
        ) {
          e.preventDefault();
          s.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
