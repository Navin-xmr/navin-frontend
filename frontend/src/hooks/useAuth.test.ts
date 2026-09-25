import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from './useAuth';
import { clearToken, setToken } from '../services/auth/tokenStorage';

const { mockRedirectToLogin } = vi.hoisted(() => ({ mockRedirectToLogin: vi.fn() }));

vi.mock('../services/auth/sessionRedirect', () => ({
  redirectToLogin: mockRedirectToLogin,
}));

const AUTH_STORAGE_KEY = 'authToken';

function base64url(input: object): string {
  const json = JSON.stringify(input);
  const base64 = btoa(json);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload: Record<string, unknown>): string {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const body = base64url(payload);
  return `${header}.${body}.signature`;
}

/** Simulates the `storage` event the browser fires when another tab writes. */
function dispatchStorageEvent(key: string | null, newValue: string | null, oldValue: string | null = null) {
  window.dispatchEvent(
    new StorageEvent('storage', { key, newValue, oldValue, storageArea: localStorage }),
  );
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
    setVisibility('visible');
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    localStorage.clear();
    setVisibility('visible');
  });

  it('returns unauthenticated state when no token exists', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toMatchObject({
      isLoading: false,
      isAuthenticated: false,
      role: null,
      userId: null,
    });
  });

  it('returns role, user id, and authenticated state for a valid token', () => {
    const token = makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('company');
    expect(result.current.userId).toBe('user-1');
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe(token);
  });

  it('returns unauthenticated state for an expired token', () => {
    const token = makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) - 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('handles malformed tokens without throwing', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'not-a-jwt');

    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toMatchObject({
      isLoading: false,
      isAuthenticated: false,
      role: null,
      userId: null,
    });
  });

  it('updates to unauthenticated when the token is removed between renders', () => {
    const token = makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(true);

    localStorage.removeItem(AUTH_STORAGE_KEY);
    setVisibility('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
    expect(result.current.userId).toBeNull();
  });

  it('treats an unrecognised role as unauthenticated and leaves the token alone', () => {
    const token = makeToken({ sub: 'user-1', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toMatchObject({
      isLoading: false,
      isAuthenticated: false,
      role: null,
      userId: null,
    });
    // Unrecognised, not malformed: signing the user out of it would be wrong.
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe(token);
  });

  it('normalises a role the backend sends in a different case', () => {
    const token = makeToken({ sub: 'user-1', role: 'COMPANY', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('company');
  });

  it('treats a token without a role claim as unauthenticated', () => {
    const token = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
  });

  it('starts with loading set to true', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
  });

  it('updates immediately when a token is stored through tokenStorage (#813)', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      setToken(makeToken({ sub: 'user-9', role: 'customer', exp: Math.floor(Date.now() / 1000) + 3600 }));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('customer');
    expect(result.current.userId).toBe('user-9');

    act(() => {
      clearToken();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
  });

  it('exposes refresh() to re-read the stored token on demand', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.isAuthenticated).toBe(false);

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      makeToken({ sub: 'user-2', role: 'company', exp: Math.floor(Date.now() / 1000) + 3600 }),
    );

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('company');
  describe('cross-tab sync (#819)', () => {
    const validToken = () =>
      makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) + 3600 });

    it('signs this tab in when another tab stores a token', () => {
      const { result } = renderHook(() => useAuth());
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.isAuthenticated).toBe(false);

      const token = validToken();
      act(() => {
        // The other tab has already written to the shared storage area.
        localStorage.setItem(AUTH_STORAGE_KEY, token);
        dispatchStorageEvent(AUTH_STORAGE_KEY, token);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.role).toBe('company');
      expect(mockRedirectToLogin).not.toHaveBeenCalled();
    });

    it('signs this tab out and redirects to /login when another tab removes the token', () => {
      const token = validToken();
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      const { result } = renderHook(() => useAuth());
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        dispatchStorageEvent(AUTH_STORAGE_KEY, null, token);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.role).toBeNull();
      expect(mockRedirectToLogin).toHaveBeenCalledOnce();
    });

    it('treats localStorage.clear() in another tab as a logout', () => {
      localStorage.setItem(AUTH_STORAGE_KEY, validToken());
      const { result } = renderHook(() => useAuth());
      act(() => {
        vi.advanceTimersByTime(200);
      });

      act(() => {
        localStorage.clear();
        dispatchStorageEvent(null, null);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRedirectToLogin).toHaveBeenCalledOnce();
    });

    it('ignores storage events for unrelated keys', () => {
      localStorage.setItem(AUTH_STORAGE_KEY, validToken());
      const { result } = renderHook(() => useAuth());
      act(() => {
        vi.advanceTimersByTime(200);
      });

      act(() => {
        dispatchStorageEvent('navin-theme', null, 'dark');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(mockRedirectToLogin).not.toHaveBeenCalled();
    });

    it('stops listening once unmounted', () => {
      localStorage.setItem(AUTH_STORAGE_KEY, validToken());
      const { unmount } = renderHook(() => useAuth());
      act(() => {
        vi.advanceTimersByTime(200);
      });
      unmount();

      localStorage.removeItem(AUTH_STORAGE_KEY);
      dispatchStorageEvent(AUTH_STORAGE_KEY, null, 'old-token');

      expect(mockRedirectToLogin).not.toHaveBeenCalled();
    });
  });
});
