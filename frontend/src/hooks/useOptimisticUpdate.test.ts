import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useOptimisticUpdate } from './useOptimisticUpdate';

const mockAddToast = vi.fn();
const mockAnnounce = vi.fn();

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock('../context/LiveRegionContext', () => ({
  useLiveRegion: () => ({ announce: mockAnnounce }),
}));

describe('useOptimisticUpdate', () => {
  beforeEach(() => {
    mockAddToast.mockClear();
    mockAnnounce.mockClear();
  });

  it('starts with isMutating false', () => {
    const { result } = renderHook(() =>
      useOptimisticUpdate({
        onMutate: async () => {},
        onRollback: () => {},
      }),
    );

    expect(result.current.isMutating).toBe(false);
  });

  it('handles successful mutation and announces success message', async () => {
    const onMutate = vi.fn().mockResolvedValue('ok');
    const onRollback = vi.fn();

    const { result } = renderHook(() =>
      useOptimisticUpdate<string>({
        onMutate,
        onRollback,
        successMessage: 'Updated successfully',
      }),
    );

    await act(async () => {
      await result.current.mutate('previous-state');
    });

    expect(onMutate).toHaveBeenCalledTimes(1);
    expect(onRollback).not.toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith('Updated successfully', 'success');
    expect(mockAnnounce).toHaveBeenCalledWith('Updated successfully', 'polite');
    expect(result.current.isMutating).toBe(false);
  });

  it('does not toast or announce when successMessage is omitted', async () => {
    const onMutate = vi.fn().mockResolvedValue('ok');
    const onRollback = vi.fn();

    const { result } = renderHook(() =>
      useOptimisticUpdate<string>({
        onMutate,
        onRollback,
      }),
    );

    await act(async () => {
      await result.current.mutate('state');
    });

    expect(mockAddToast).not.toHaveBeenCalled();
    expect(mockAnnounce).not.toHaveBeenCalled();
  });

  it('rolls back to snapshot and announces error on rejection', async () => {
    const onMutate = vi.fn().mockRejectedValue(new Error('API failure'));
    const onRollback = vi.fn();

    const { result } = renderHook(() =>
      useOptimisticUpdate<{ id: number }>({
        onMutate,
        onRollback,
        errorMessage: 'Custom error occurred',
      }),
    );

    const snapshot = { id: 123 };

    await act(async () => {
      await result.current.mutate(snapshot);
    });

    expect(onRollback).toHaveBeenCalledWith(snapshot);
    expect(mockAddToast).toHaveBeenCalledWith('Custom error occurred', 'error');
    expect(mockAnnounce).toHaveBeenCalledWith('Custom error occurred', 'assertive');
    expect(result.current.isMutating).toBe(false);
  });

  it('uses fallback message when errorMessage is not provided', async () => {
    const onMutate = vi.fn().mockRejectedValue(new Error('Network error'));
    const onRollback = vi.fn();

    const { result } = renderHook(() =>
      useOptimisticUpdate<number>({
        onMutate,
        onRollback,
      }),
    );

    await act(async () => {
      await result.current.mutate(42);
    });

    expect(onRollback).toHaveBeenCalledWith(42);
    expect(mockAddToast).toHaveBeenCalledWith(
      'Operation failed. Changes have been reverted.',
      'error',
    );
    expect(mockAnnounce).toHaveBeenCalledWith(
      'Operation failed. Changes have been reverted.',
      'assertive',
    );
  });
});
