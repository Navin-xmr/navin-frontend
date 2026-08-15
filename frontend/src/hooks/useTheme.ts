import { createContext, useContext, useEffect, useCallback, createElement, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'navin-theme';

function getSystemPreference(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function migrateLegacyStorage(): void {
  if (typeof window === 'undefined') return;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return;
  try {
    const parsed = JSON.parse(stored);
    if (parsed === 'dark' || parsed === 'light') return;
  } catch {
    // Not valid JSON - could be legacy raw format
  }
  if (stored === 'dark' || stored === 'light') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

migrateLegacyStorage();

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { value: theme, setValue: setTheme } = useLocalStorage<Theme>(
    STORAGE_KEY,
    getSystemPreference(),
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handleSystemChange);

    return () => {
      mq.removeEventListener('change', handleSystemChange);
    };
  }, [setTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  return createElement(ThemeContext.Provider, { value: { theme, toggleTheme } }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
