import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTheme, ThemeProvider } from './useTheme';

const STORAGE_KEY = 'navin-theme';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('returns theme and toggleTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBeDefined();
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('defaults to light theme when no stored preference and system prefers light', () => {
    mockMatchMedia(false); // prefers-color-scheme: light
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
  });

  it('defaults to dark theme when system prefers dark and no stored preference', () => {
    mockMatchMedia(true); // prefers-color-scheme: dark
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('dark');
  });

  it('reads stored theme from localStorage (dark)', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('dark');
  });

  it('reads stored theme from localStorage (light)', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
  });

  it('toggleTheme switches from light to dark', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
  });

  it('toggleTheme switches from dark to light', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('toggleTheme persists new theme to localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('applies dark class to document.documentElement when theme is dark', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    renderHook(() => useTheme(), { wrapper });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from document.documentElement when theme is light', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem(STORAGE_KEY, 'light');
    renderHook(() => useTheme(), { wrapper });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists changes to localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    // Verify that toggleTheme persists to localStorage
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('registers and cleans up media query listener', () => {
    const addListenerMock = vi.fn();
    const removeListenerMock = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: addListenerMock,
        removeEventListener: removeListenerMock,
        dispatchEvent: vi.fn(),
      })),
    });

    const { unmount } = renderHook(() => useTheme(), { wrapper });
    expect(addListenerMock).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(removeListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('system preference change updates theme when no stored preference', () => {
    localStorage.clear();
    let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
          mediaHandler = handler;
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');

    act(() => {
      if (mediaHandler) {
        mediaHandler({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current.theme).toBe('dark');
  });

  it('system preference change is ignored when stored preference exists', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
          mediaHandler = handler;
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');

    act(() => {
      if (mediaHandler) {
        mediaHandler({ matches: true } as MediaQueryListEvent);
      }
    });

    // Should remain light because stored preference exists
    expect(result.current.theme).toBe('light');
  });
});
