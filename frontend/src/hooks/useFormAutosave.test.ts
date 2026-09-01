import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useFormAutosave from './useFormAutosave';

describe('useFormAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('starts with idle status', () => {
    const { result } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-test', data: { name: 'test' } }),
    );
    expect(result.current.status).toBe('idle');
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('does NOT trigger save on first mount (isMountedRef pattern)', () => {
    renderHook(() =>
      useFormAutosave({ storageKey: 'form-mount', data: { name: 'test' } }),
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(localStorage.getItem('form-mount')).toBeNull();
  });

  it('debounces save after data changes post-mount', () => {
    let formData = { name: 'initial' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-debounce', data: formData, debounceMs: 1500 }),
    );

    // Change data after mount — triggers debounce
    formData = { name: 'updated' };
    rerender();

    // Saving state is set immediately; the write fires after the debounce
    expect(result.current.status).toBe('saving');

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.status).toBe('saved');
    expect(localStorage.getItem('form-debounce')).not.toBeNull();
  });

  it('respects custom debounceMs', () => {
    let formData = { value: 1 };
    const { result, rerender } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-custom', data: formData, debounceMs: 500 }),
    );

    formData = { value: 2 };
    rerender();

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.status).toBe('saving');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.status).toBe('saved');
  });

  it('resets debounce timer when data changes rapidly', () => {
    let formData = { text: 'a' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-rapid', data: formData, debounceMs: 1000 }),
    );

    formData = { text: 'ab' };
    rerender();

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.status).toBe('saving');

    formData = { text: 'abc' };
    rerender();

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.status).toBe('saving');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.status).toBe('saved');
  });

  it('sets lastSavedAt after successful save', () => {
    let formData = { text: 'hello' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-date', data: formData, debounceMs: 500 }),
    );

    formData = { text: 'world' };
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.lastSavedAt).toBeInstanceOf(Date);
  });

  it('saveNow() persists the latest data immediately, bypassing debounce', () => {
    let formData = { name: 'pending' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-savenow', data: formData, debounceMs: 5000 }),
    );

    formData = { name: 'immediate' };
    rerender();

    act(() => {
      result.current.saveNow();
    });

    expect(result.current.status).toBe('saved');
    const stored = localStorage.getItem('form-savenow');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!) as { name: string };
    expect(parsed.name).toBe('immediate');
  });

  it('loadDraft() returns previously saved data', () => {
    let formData = { name: 'persisted' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-load', data: formData }),
    );

    act(() => {
      result.current.saveNow();
    });
    void rerender;

    const loaded = result.current.loadDraft() as { name: string };
    expect(loaded).toEqual({ name: 'persisted' });
  });

  it('loadDraft() returns null when no draft exists', () => {
    const { result } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-no-draft', data: {} }),
    );
    expect(result.current.loadDraft()).toBeNull();
  });

  it('clearDraft() removes item from localStorage and resets status to idle', () => {
    let formData = { name: 'to-clear' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-clear', data: formData }),
    );

    act(() => {
      result.current.saveNow();
    });
    void rerender;

    expect(result.current.status).toBe('saved');
    expect(localStorage.getItem('form-clear')).not.toBeNull();

    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.status).toBe('idle');
    expect(localStorage.getItem('form-clear')).toBeNull();
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('status transitions: idle → saving → saved', () => {
    let formData = { val: 0 };
    const { result, rerender } = renderHook(() =>
      useFormAutosave({ storageKey: 'form-transition', data: formData, debounceMs: 300 }),
    );

    formData = { val: 1 };
    rerender();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.status).toBe('saved');
  });
});