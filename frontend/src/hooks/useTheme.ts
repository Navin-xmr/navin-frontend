import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  createElement,
  type ReactNode,
} from 'react';
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
  // Persist the explicit user preference via useLocalStorage.
  // null means "no stored preference — follow the system".
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme | null>(
    STORAGE_KEY,
    null,
  );

  const [theme, setTheme] = useState<Theme>(
    storedTheme ?? getSystemPreference(),
  );

  // Apply the CSS class on every theme change.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // Track system dark-mode preference and apply it when no user preference is stored.
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (storedTheme === null) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handleSystemChange);

    // Keep theme in sync across tabs/windows.
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      mq.removeEventListener('change', handleSystemChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [storedTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      setStoredTheme(next);
      return next;
    });
  }, [setStoredTheme]);

  return createElement(
    ThemeContext.Provider,
    { value: { theme, toggleTheme } },
    children,
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
