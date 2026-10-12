import { createContext, useContext, useState, useEffect, useCallback, createElement, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'navin-theme';

function getSystemPreference(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

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
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme | null>(
    STORAGE_KEY,
    () => {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    },
    { raw: true },
  );

  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemPreference);

  const rawTheme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
  const theme: Theme = rawTheme ?? systemTheme;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handleSystemChange);

    return () => {
      mq.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setStoredTheme((prev) => {
      const current = prev === 'dark' || prev === 'light' ? prev : getSystemPreference();
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [setStoredTheme]);

  return createElement(ThemeContext.Provider, { value: { theme, toggleTheme } }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
