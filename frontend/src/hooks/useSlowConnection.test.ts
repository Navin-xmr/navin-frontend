import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSlowConnection } from './useSlowConnection';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g';

interface FakeConnection extends EventTarget {
  effectiveType: EffectiveType;
  saveData: boolean;
}

function makeConnection(effectiveType: EffectiveType = '4g'): FakeConnection {
  const target = new EventTarget() as FakeConnection;
  target.effectiveType = effectiveType;
  target.saveData = false;
  return target;
}

function stubNavigatorConnection(conn: FakeConnection | undefined) {
  Object.defineProperty(navigator, 'connection', {
    value: conn,
    configurable: true,
    writable: true,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useSlowConnection', () => {
  afterEach(() => {
    // Remove the stub so other tests start clean
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it('returns false when navigator.connection is unavailable', () => {
    stubNavigatorConnection(undefined);
    const { result } = renderHook(() => useSlowConnection());
    expect(result.current).toBe(false);
  });

  it('returns false when effectiveType is 4g', () => {
    stubNavigatorConnection(makeConnection('4g'));
    const { result } = renderHook(() => useSlowConnection());
    expect(result.current).toBe(false);
  });

  it('returns false when effectiveType is 3g', () => {
    stubNavigatorConnection(makeConnection('3g'));
    const { result } = renderHook(() => useSlowConnection());
    expect(result.current).toBe(false);
  });

  it('returns true when effectiveType is 2g', () => {
    stubNavigatorConnection(makeConnection('2g'));
    const { result } = renderHook(() => useSlowConnection());
    expect(result.current).toBe(true);
  });

  it('returns true when effectiveType is slow-2g', () => {
    stubNavigatorConnection(makeConnection('slow-2g'));
    const { result } = renderHook(() => useSlowConnection());
    expect(result.current).toBe(true);
  });

  // ── Reactivity on network change ──────────────────────────────────────────

  it('updates to true when connection degrades from 4g to 2g', () => {
    const conn = makeConnection('4g');
    stubNavigatorConnection(conn);
    const { result } = renderHook(() => useSlowConnection());

    expect(result.current).toBe(false);

    act(() => {
      conn.effectiveType = '2g';
      conn.dispatchEvent(new Event('change'));
    });

    expect(result.current).toBe(true);
  });

  it('updates to false when connection improves from slow-2g to 4g', () => {
    const conn = makeConnection('slow-2g');
    stubNavigatorConnection(conn);
    const { result } = renderHook(() => useSlowConnection());

    expect(result.current).toBe(true);

    act(() => {
      conn.effectiveType = '4g';
      conn.dispatchEvent(new Event('change'));
    });

    expect(result.current).toBe(false);
  });

  // ── onChange callback ─────────────────────────────────────────────────────

  it('calls onChange with the new value when the connection changes', () => {
    const conn = makeConnection('4g');
    stubNavigatorConnection(conn);
    const onChange = vi.fn();
    renderHook(() => useSlowConnection(onChange));

    act(() => {
      conn.effectiveType = '2g';
      conn.dispatchEvent(new Event('change'));
    });

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange on initial render', () => {
    stubNavigatorConnection(makeConnection('2g'));
    const onChange = vi.fn();
    renderHook(() => useSlowConnection(onChange));
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  it('removes the change listener on unmount and stops reacting to events', () => {
    const conn = makeConnection('4g');
    stubNavigatorConnection(conn);
    const { result, unmount } = renderHook(() => useSlowConnection());

    unmount();

    act(() => {
      conn.effectiveType = '2g';
      conn.dispatchEvent(new Event('change'));
    });

    // State never updated after unmount — still false from initial render
    expect(result.current).toBe(false);
  });

  // ── Edge case: no effectiveType on connection object ─────────────────────

  it('returns false when connection exists but effectiveType is undefined', () => {
    const conn = new EventTarget() as FakeConnection;
    // Intentionally leave effectiveType unset (simulates older API shape)
    stubNavigatorConnection(conn);
    const { result } = renderHook(() => useSlowConnection());
    expect(result.current).toBe(false);
  });
});
