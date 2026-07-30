import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from './useAuth';

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

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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

    expect(result.current).toEqual({
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

    expect(result.current).toEqual({
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

  it('starts with loading set to true', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
  });
});
