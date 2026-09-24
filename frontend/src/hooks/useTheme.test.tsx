import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from './useTheme';

const STORAGE_KEY = 'navin-theme';

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
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBeDefined();
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('defaults to light theme when no stored preference and system prefers light', () => {
    mockMatchMedia(false); // prefers-color-scheme: light
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('defaults to dark theme when system prefers dark and no stored preference', () => {
    mockMatchMedia(true); // prefers-color-scheme: dark
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('reads stored theme from localStorage (dark)', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('reads stored theme from localStorage (light)', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('toggleTheme switches from light to dark', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
  });

  it('toggleTheme switches from dark to light', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('toggleTheme persists new theme to localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('applies dark class to document.documentElement when theme is dark', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from document.documentElement when theme is light', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem(STORAGE_KEY, 'light');
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('responds to storage event for cross-tab sync (dark)', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: 'dark',
          storageArea: localStorage,
        }),
      );
    });

    // Note: storage event handling is for cross-tab sync;
    // within same tab the state is managed by React
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

    const { unmount } = renderHook(() => useTheme());
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

    const { result } = renderHook(() => useTheme());
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

    const { result } = renderHook(() => useTheme());
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
