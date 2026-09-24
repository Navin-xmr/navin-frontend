import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormDraft } from './useFormDraft';

type DraftShape = { name?: string; x?: number; email?: string; msg?: string; data?: string; note?: string };

const notEmpty = (_values: DraftShape) => false;
const nameEmpty = (values: DraftShape) => Boolean(values.name === '');

describe('useFormDraft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('starts with null draft when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useFormDraft<DraftShape>('draft-empty', { name: '' }, notEmpty),
    );
    expect(result.current.draft).toBeNull();
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('reads existing draft from localStorage on mount', () => {
    const existing = { values: { name: 'pre-saved' }, savedAt: new Date().toISOString() };
    localStorage.setItem('draft-existing', JSON.stringify(existing));

    const { result } = renderHook(() =>
      useFormDraft<DraftShape>('draft-existing', { name: '' }, notEmpty),
    );
    expect(result.current.draft).not.toBeNull();
    expect(result.current.draft?.values.name).toBe('pre-saved');
  });

  it('autosaves to localStorage after debounce (empty storage, no pending draft)', () => {
    let values: DraftShape = { name: 'initial' };
    const { result, rerender } = renderHook(() =>
      useFormDraft<DraftShape>('draft-autosave', values, notEmpty),
    );

    // Change values to trigger autosave
    values = { name: 'changed' };
    rerender();

    expect(result.current.draft).toBeNull();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.lastSavedAt).toBeInstanceOf(Date);
    const raw = localStorage.getItem('draft-autosave');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as { values: { name: string } };
    expect(parsed.values.name).toBe('changed');
  });

  it('respects custom debounceMs', () => {
    let values: DraftShape = { x: 1 };
    const { rerender } = renderHook(() =>
      useFormDraft<DraftShape>('draft-custom-debounce', values, notEmpty, { debounceMs: 300 }),
    );

    values = { x: 2 };
    rerender();

    act(() => { vi.advanceTimersByTime(299); });
    expect(localStorage.getItem('draft-custom-debounce')).toBeNull();

    act(() => { vi.advanceTimersByTime(1); });
    const raw = localStorage.getItem('draft-custom-debounce');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as { values: { x: number } };
    expect(parsed.values.x).toBe(2);
  });

  it('does NOT autosave when a pending draft exists on mount', () => {
    const existing = { values: { name: 'stored' }, savedAt: new Date().toISOString() };
    localStorage.setItem('draft-pending', JSON.stringify(existing));

let values: DraftShape = { name: 'stored' };
    const { rerender } = renderHook(() =>
      useFormDraft<DraftShape>('draft-pending', values, notEmpty),
    );

    // Change values — should NOT autosave because a pending draft exists.
    values = { name: 'new-value' };
    rerender();

    act(() => { vi.advanceTimersByTime(2000); });

    // Draft should still reflect the original stored value (no new write)
    const raw = localStorage.getItem('draft-pending');
    const parsed = JSON.parse(raw!) as { values: { name: string } };
    expect(parsed.values.name).toBe('stored');
  });

  it('does NOT autosave when disabled is true', () => {
    let values: DraftShape = { name: 'hello' };
    const { result, rerender } = renderHook(() =>
      useFormDraft<DraftShape>('draft-disabled', values, notEmpty, { disabled: true }),
    );

    values = { name: 'world' };
    rerender();

    act(() => { vi.advanceTimersByTime(2000); });

    expect(result.current.draft).toBeNull();
    expect(localStorage.getItem('draft-disabled')).toBeNull();
  });

  it('restoreDraft() returns draft values and clears draft state', () => {
    const existing = { values: { email: 'test@example.com' }, savedAt: new Date().toISOString() };
    localStorage.setItem('draft-restore', JSON.stringify(existing));

    const { result } = renderHook(() =>
      useFormDraft<DraftShape>('draft-restore', { email: '' }, notEmpty),
    );

    expect(result.current.draft).not.toBeNull();

    let restored: DraftShape | null = null;
    act(() => {
      restored = result.current.restoreDraft();
    });

    expect(restored).toEqual({ email: 'test@example.com' });
    expect(result.current.draft).toBeNull();
  });

  it('discardDraft() clears state and localStorage', () => {
    const existing = { values: { msg: 'discard me' }, savedAt: new Date().toISOString() };
    localStorage.setItem('draft-discard', JSON.stringify(existing));

    const { result } = renderHook(() =>
      useFormDraft<DraftShape>('draft-discard', { msg: '' }, notEmpty),
    );

    expect(result.current.draft).not.toBeNull();

    act(() => {
      result.current.discardDraft();
    });

    expect(result.current.draft).toBeNull();
    expect(localStorage.getItem('draft-discard')).toBeNull();
  });

  it('clearDraft() removes from localStorage and nulls draft', () => {
    const existing = { values: { data: 'some' }, savedAt: new Date().toISOString() };
    localStorage.setItem('draft-clear', JSON.stringify(existing));

    const { result } = renderHook(() =>
      useFormDraft<DraftShape>('draft-clear', { data: '' }, notEmpty),
    );

    act(() => {
      result.current.clearDraft();
    });

    expect(localStorage.getItem('draft-clear')).toBeNull();
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('isEmpty guard — calls clearDraft when form is empty', async () => {
    const { result } = renderHook(() =>
      useFormDraft<DraftShape>('draft-isempty', { name: '' }, nameEmpty),
    );

    // Allow queueMicrotask to flush
    await act(async () => {
      await Promise.resolve();
    });

    expect(localStorage.getItem('draft-isempty')).toBeNull();
    expect(result.current.draft).toBeNull();
  });

  it('lastSavedAt is set after successful autosave', () => {
    let values: DraftShape = { note: 'a' };
    const { result, rerender } = renderHook(() =>
      useFormDraft<DraftShape>('draft-lastsaved', values, notEmpty, { debounceMs: 200 }),
    );

    values = { note: 'b' };
    rerender();

    act(() => { vi.advanceTimersByTime(200); });

    expect(result.current.lastSavedAt).toBeInstanceOf(Date);
  });
});