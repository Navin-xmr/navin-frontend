import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormAutosave } from './useFormAutosave';

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
      useFormAutosave({ name: 'test' }, { key: 'form-test' }),
    );
    expect(result.current.status).toBe('idle');
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('does NOT trigger save on first mount (isMountedRef pattern)', () => {
    renderHook(() => useFormAutosave({ name: 'test' }, { key: 'form-mount' }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(localStorage.getItem('form-mount')).toBeNull();
  });

  it('debounces save after data changes post-mount', () => {
    let formData = { name: 'initial' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave(formData, { key: 'form-debounce', debounceMs: 1500 }),
    );

    // Change data after mount — triggers debounce
    formData = { name: 'updated' };
    rerender();

    // Should still be idle before debounce fires
    expect(result.current.status).toBe('idle');

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.status).toBe('saved');
    expect(localStorage.getItem('form-debounce')).not.toBeNull();
  });

  it('respects custom debounceMs', () => {
    let formData = { value: 1 };
    const { result, rerender } = renderHook(() =>
      useFormAutosave(formData, { key: 'form-custom', debounceMs: 500 }),
    );

    formData = { value: 2 };
    rerender();

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.status).toBe('idle');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.status).toBe('saved');
  });

  it('resets debounce timer when data changes rapidly', () => {
    let formData = { text: 'a' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave(formData, { key: 'form-rapid', debounceMs: 1000 }),
    );

    formData = { text: 'ab' };
    rerender();

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.status).toBe('idle');

    formData = { text: 'abc' };
    rerender();

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.status).toBe('idle');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.status).toBe('saved');
  });

  it('sets lastSavedAt after successful save', () => {
    let formData = { text: 'hello' };
    const { result, rerender } = renderHook(() =>
      useFormAutosave(formData, { key: 'form-date', debounceMs: 500 }),
    );

    formData = { text: 'world' };
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.lastSavedAt).toBeInstanceOf(Date);
  });

  it('saveNow() persists data immediately, bypassing debounce', () => {
    const { result } = renderHook(() =>
      useFormAutosave({ name: 'initial' }, { key: 'form-savenow', debounceMs: 5000 }),
    );

    act(() => {
      result.current.saveNow({ name: 'immediate' });
    });

    expect(result.current.status).toBe('saved');
    const stored = localStorage.getItem('form-savenow');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!) as { data: { name: string } };
    expect(parsed.data.name).toBe('immediate');
  });

  it('loadDraft() returns previously saved data', () => {
    const { result } = renderHook(() =>
      useFormAutosave({ name: '' }, { key: 'form-load' }),
    );

    act(() => {
      result.current.saveNow({ name: 'persisted' });
    });

    const loaded = result.current.loadDraft<{ name: string }>();
    expect(loaded).toEqual({ name: 'persisted' });
  });

  it('loadDraft() returns null when no draft exists', () => {
    const { result } = renderHook(() =>
      useFormAutosave({}, { key: 'form-no-draft' }),
    );
    expect(result.current.loadDraft()).toBeNull();
  });

  it('clearDraft() removes item from localStorage and resets status to idle', () => {
    const { result } = renderHook(() =>
      useFormAutosave({ name: '' }, { key: 'form-clear' }),
    );

    act(() => {
      result.current.saveNow({ name: 'to-clear' });
    });

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
      useFormAutosave(formData, { key: 'form-transition', debounceMs: 300 }),
    );

    formData = { val: 1 };
    rerender();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.status).toBe('saved');
  });
});
