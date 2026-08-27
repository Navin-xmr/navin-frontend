import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts, type ShortcutDef } from './useKeyboardShortcuts';

function fireKeydown(target: EventTarget, init: KeyboardEventInit): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));
}

describe('useKeyboardShortcuts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the matching shortcut callback when the exact key/modifier combo is pressed', () => {
    const callback = vi.fn();
    const shortcuts: ShortcutDef[] = [
      { key: 'd', alt: true, callback, label: 'Go to Dashboard' },
    ];
    renderHook(() => useKeyboardShortcuts(shortcuts));

    fireKeydown(window, { key: 'd', altKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('matches case-insensitively on the key', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcuts([{ key: 'd', alt: true, callback, label: 'Go to Dashboard' }]));

    fireKeydown(window, { key: 'D', altKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call the callback when a required modifier is missing', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcuts([{ key: 'd', alt: true, callback, label: 'Go to Dashboard' }]));

    fireKeydown(window, { key: 'd' });

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call the callback when an extra modifier is held that the shortcut does not expect', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcuts([{ key: 'd', alt: true, callback, label: 'Go to Dashboard' }]));

    fireKeydown(window, { key: 'd', altKey: true, shiftKey: true });

    expect(callback).not.toHaveBeenCalled();
  });

  it('ignores keystrokes typed into an input, textarea, or select', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcuts([{ key: 'd', alt: true, callback, label: 'Go to Dashboard' }]));

    const input = document.createElement('input');
    document.body.appendChild(input);
    fireKeydown(input, { key: 'd', altKey: true });
    document.body.removeChild(input);

    expect(callback).not.toHaveBeenCalled();
  });

  it('stops at the first matching shortcut and calls preventDefault', () => {
    const first = vi.fn();
    const second = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'd', alt: true, callback: first, label: 'First' },
        { key: 'd', alt: true, callback: second, label: 'Second (unreachable duplicate)' },
      ]),
    );

    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'd', altKey: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it('removes its listener on unmount so callbacks no longer fire', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: 'd', alt: true, callback, label: 'Go to Dashboard' }]),
    );

    unmount();
    fireKeydown(window, { key: 'd', altKey: true });

    expect(callback).not.toHaveBeenCalled();
  });

  it('picks up a new shortcuts array on re-render instead of using a stale closure', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ shortcuts }: { shortcuts: ShortcutDef[] }) => useKeyboardShortcuts(shortcuts),
      { initialProps: { shortcuts: [{ key: 'd', alt: true, callback: first, label: 'First' }] } },
    );

    rerender({ shortcuts: [{ key: 'd', alt: true, callback: second, label: 'Second' }] });
    fireKeydown(window, { key: 'd', altKey: true });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
