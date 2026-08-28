import { renderHook, waitFor } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

function buildContainer(): { container: HTMLDivElement; first: HTMLButtonElement; last: HTMLButtonElement } {
  const container = document.createElement('div');
  const first = document.createElement('button');
  first.textContent = 'First';
  const middle = document.createElement('button');
  middle.textContent = 'Middle';
  const last = document.createElement('button');
  last.textContent = 'Last';
  container.append(first, middle, last);
  document.body.appendChild(container);
  return { container, first, last };
}

function fireKeydown(init: KeyboardEventInit): boolean {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  return document.dispatchEvent(event);
}

describe('useFocusTrap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('moves focus to the first focusable element inside the container when activated', async () => {
    const { container, first } = buildContainer();
    const ref: RefObject<HTMLElement | null> = { current: container };

    renderHook(() => useFocusTrap(ref, true));

    await waitFor(() => expect(document.activeElement).toBe(first));
  });

  it('does nothing when inactive', async () => {
    const { container } = buildContainer();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    const ref: RefObject<HTMLElement | null> = { current: container };

    renderHook(() => useFocusTrap(ref, false));

    expect(document.activeElement).toBe(outside);
  });

  it('wraps focus from the last element to the first on Tab', async () => {
    const { container, first, last } = buildContainer();
    const ref: RefObject<HTMLElement | null> = { current: container };
    renderHook(() => useFocusTrap(ref, true));
    await waitFor(() => expect(document.activeElement).toBe(first));

    last.focus();
    const notPrevented = fireKeydown({ key: 'Tab' });

    expect(notPrevented).toBe(false); // preventDefault() was called
    expect(document.activeElement).toBe(first);
  });

  it('wraps focus from the first element to the last on Shift+Tab', async () => {
    const { container, first, last } = buildContainer();
    const ref: RefObject<HTMLElement | null> = { current: container };
    renderHook(() => useFocusTrap(ref, true));
    await waitFor(() => expect(document.activeElement).toBe(first));

    fireKeydown({ key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(last);
  });

  it('does not intervene on Tab when focus is not on a boundary element', async () => {
    const { container, first } = buildContainer();
    const ref: RefObject<HTMLElement | null> = { current: container };
    renderHook(() => useFocusTrap(ref, true));
    await waitFor(() => expect(document.activeElement).toBe(first));

    const middle = container.children[1] as HTMLElement;
    middle.focus();
    const notPrevented = fireKeydown({ key: 'Tab' });

    expect(notPrevented).toBe(true); // preventDefault() was not called
    expect(document.activeElement).toBe(middle);
  });

  it('calls onEscape when Escape is pressed while active', async () => {
    const { container, first } = buildContainer();
    const onEscape = vi.fn();
    const ref: RefObject<HTMLElement | null> = { current: container };
    renderHook(() => useFocusTrap(ref, true, onEscape));
    await waitFor(() => expect(document.activeElement).toBe(first));

    fireKeydown({ key: 'Escape' });

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('restores focus to the previously-focused element on deactivation', async () => {
    const { container, first } = buildContainer();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const ref: RefObject<HTMLElement | null> = { current: container };

    const { rerender } = renderHook(({ active }: { active: boolean }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });
    await waitFor(() => expect(document.activeElement).toBe(first));

    rerender({ active: false });

    expect(document.activeElement).toBe(trigger);
  });

  it('restores focus to the previously-focused element on unmount', async () => {
    const { container, first } = buildContainer();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const ref: RefObject<HTMLElement | null> = { current: container };

    const { unmount } = renderHook(() => useFocusTrap(ref, true));
    await waitFor(() => expect(document.activeElement).toBe(first));

    unmount();

    expect(document.activeElement).toBe(trigger);
  });

  it('does not respond to keystrokes after becoming inactive', async () => {
    const { container, first, last } = buildContainer();
    const ref: RefObject<HTMLElement | null> = { current: container };
    const { rerender } = renderHook(({ active }: { active: boolean }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });
    await waitFor(() => expect(document.activeElement).toBe(first));

    rerender({ active: false });
    last.focus();
    fireKeydown({ key: 'Tab' });

    // No trap listener remains, so focus stays put instead of wrapping to `first`.
    expect(document.activeElement).toBe(last);
  });
});
