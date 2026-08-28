import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormDraft } from './useFormDraft';

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
      useFormDraft({ key: 'draft-empty', values: { name: '' } }),
    );
    expect(result.current.draft).toBeNull();
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('reads existing draft from localStorage on mount', () => {
    const existing = { values: { name: 'pre-saved' }, savedAt: new Date().toISOString() };
    localStorage.setItem('draft-existing', JSON.stringify(existing));

    const { result } = renderHook(() =>
      useFormDraft({ key: 'draft-existing', values: { name: '' } }),
    );
    expect(result.current.draft).not.toBeNull();
    expect(result.current.draft?.values.name).toBe('pre-saved');
  });

  it('autosaves to localStorage after debounce (empty storage, no pending draft)', () => {
    let values = { name: 'initial' };
    const { result, rerender } = renderHook(() =>
      useFormDraft({ key: 'draft-autosave', values }),
    );

    // Change values to trigger autosave
    values = { name: 'changed' };
    rerender();

    expect(result.current.draft).toBeNull();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.draft).not.toBeNull();
    expect(result.current.draft?.values.name).toBe('changed');
    expect(localStorage.getItem('draft-autosave')).not.toBeNull();
  });

  it('respects custom debounceMs', () => {
    let values = { x: 1 };
    const { result, rerender } = renderHook(() =>
      useFormDraft({ key: 'draft-custom-debounce', values, debounceMs: 300 }),
    );

    values = { x: 2 };
    rerender();

    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current.draft).toBeNull();

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current.draft).not.toBeNull();
    expect(result.current.draft?.values.x).toBe(2);
  });

  it('does NOT autosave when hasPendingDraft is true (draft exists on mount)', () => {
    const existing = { values: { name: 'stored' }, savedAt: new Date().toISOString() };
    localStorage.setItem('draft-pending', JSON.stringify(existing));

    let values = { name: 'stored' };
    const { result, rerender } = renderHook(() =>
      useFormDraft({ key: 'draft-pending', values }),
    );

    expect(result.current.draft?.values.name).toBe('stored');

    // Change values — should NOT autosave because hasPendingDraft is true
    values = { name: 'new-value' };
    rerender();

    act(() => { vi.advanceTimersByTime(2000); });

    // Draft should still reflect the original stored value (no new write)
    const raw = localStorage.getItem('draft-pending');
    const parsed = JSON.parse(raw!) as { values: { name: string } };
    expect(parsed.values.name).toBe('stored');
  });

  it('does NOT autosave when disabled is true', () => {
    let values = { name: 'hello' };
    const { result, rerender } = renderHook(() =>
      useFormDraft({ key: 'draft-disabled', values, disabled: true }),
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
      useFormDraft({ key: 'draft-restore', values: { email: '' } }),
    );

    expect(result.current.draft).not.toBeNull();

    let restored: { email: string } | null = null;
    act(() => {
      restored = result.current.restoreDraft() as { email: string };
    });

    expect(restored).toEqual({ email: 'test@example.com' });
    expect(result.current.draft).toBeNull();
  });

  it('discardDraft() clears state and localStorage', () => {
    const existing = { values: { msg: 'discard me' }, savedAt: new Date().toISOString() };
    localStorage.setItem('draft-discard', JSON.stringify(existing));

    const { result } = renderHook(() =>
      useFormDraft({ key: 'draft-discard', values: { msg: '' } }),
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
      useFormDraft({ key: 'draft-clear', values: { data: '' } }),
    );

    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.draft).toBeNull();
    expect(localStorage.getItem('draft-clear')).toBeNull();
  });

  it('isEmpty guard — calls clearDraft when form is empty', async () => {
    const { result } = renderHook(() =>
      useFormDraft({
        key: 'draft-isempty',
        values: { name: '' },
        isEmpty: (v) => v.name === '',
      }),
    );

    // Allow queueMicrotask to flush
    await act(async () => {
      await Promise.resolve();
    });

    expect(localStorage.getItem('draft-isempty')).toBeNull();
    expect(result.current.draft).toBeNull();
  });

  it('lastSavedAt is set after successful autosave', () => {
    let values = { note: 'a' };
    const { result, rerender } = renderHook(() =>
      useFormDraft({ key: 'draft-lastsaved', values, debounceMs: 200 }),
    );

    values = { note: 'b' };
    rerender();

    act(() => { vi.advanceTimersByTime(200); });

    expect(result.current.lastSavedAt).toBeInstanceOf(Date);
  });
});
