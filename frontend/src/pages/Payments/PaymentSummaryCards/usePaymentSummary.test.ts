import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaymentSummary } from './usePaymentSummary';

const api = vi.hoisted(() => ({
  getSummary: vi.fn(),
}));

vi.mock('@services/api/endpoints/settlements', () => ({ settlementsApi: api }));

const summary = {
  totalReleased: 1250,
  totalInEscrow: 300,
  totalPending: 75.5,
  sparkline: [1, 2, 3],
};

describe('usePaymentSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getSummary.mockResolvedValue(summary);
  });

  it('starts loading, then returns the summary from the API', async () => {
    const { result } = renderHook(() => usePaymentSummary());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(summary);
    expect(result.current.error).toBeNull();
    expect(api.getSummary).toHaveBeenCalledWith('month');
  });

  it('requests the period it is given', async () => {
    const { result } = renderHook(() => usePaymentSummary('quarter'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(api.getSummary).toHaveBeenCalledWith('quarter');
  });

  it('exposes the error message and no data when the request fails', async () => {
    api.getSummary.mockRejectedValue(new Error('summary unavailable'));
    const { result } = renderHook(() => usePaymentSummary());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('summary unavailable');
    expect(result.current.data).toBeNull();
  });

  it('falls back to a generic message for a non-Error rejection', async () => {
    api.getSummary.mockRejectedValue('boom');
    const { result } = renderHook(() => usePaymentSummary());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Failed to load payment summary');
  });

  it('refetches on reload and clears a previous error', async () => {
    api.getSummary.mockRejectedValueOnce(new Error('summary unavailable'));
    const { result } = renderHook(() => usePaymentSummary());
    await waitFor(() => expect(result.current.error).toBe('summary unavailable'));

    act(() => result.current.reload());

    await waitFor(() => expect(result.current.data).toEqual(summary));
    expect(result.current.error).toBeNull();
    expect(api.getSummary).toHaveBeenCalledTimes(2);
  });

  it('does not write a result after unmount', async () => {
    let resolve: (value: typeof summary) => void = () => {};
    api.getSummary.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { result, unmount } = renderHook(() => usePaymentSummary());

    unmount();
    await act(async () => resolve(summary));

    expect(result.current.data).toBeNull();
  });
});
