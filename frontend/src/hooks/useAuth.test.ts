import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
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
    localStorage.clear();
    setVisibility('visible');
  });

  afterEach(() => {
    setVisibility('visible');
  });

  it('mounts with a valid token and becomes authenticated', async () => {
    const token = makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('company');
    expect(result.current.userId).toBe('user-1');
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe(token);
  });

  it('mounts with an expired token and clears it', async () => {
    const token = makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) - 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('keeps state unchanged when the tab regains focus with a still-valid token', async () => {
    const token = makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);

    setVisibility('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe(token);
  });

  it('transitions to unauthenticated when the tab regains focus with an expired token', async () => {
    const token = makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, token);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);

    const expiredToken = makeToken({ sub: 'user-1', role: 'company', exp: Math.floor(Date.now() / 1000) - 3600 });
    localStorage.setItem(AUTH_STORAGE_KEY, expiredToken);

    setVisibility('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
