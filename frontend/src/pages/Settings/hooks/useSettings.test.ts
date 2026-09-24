import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from './useSettings';
import { apiClient } from '@services/api/client';

vi.mock('@services/api/client', () => ({
  apiClient: {
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const addToast = vi.fn();
vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves successfully with the default patch method and success message', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useSettings());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.save({ url: '/api/users/me', payload: { name: 'A' } });
    });

    expect(ok).toBe(true);
    expect(apiClient.patch).toHaveBeenCalledWith('/api/users/me', { name: 'A' });
    expect(addToast).toHaveBeenCalledWith('Saved successfully.', 'success');
    expect(result.current.success).toBe('Saved successfully.');
    expect(result.current.error).toBeNull();
  });

  it('uses a custom success message and method when provided', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.save({ url: '/api/users/me', method: 'delete', successMessage: 'Deleted.' });
    });

    expect(apiClient.delete).toHaveBeenCalledWith('/api/users/me');
    expect(addToast).toHaveBeenCalledWith('Deleted.', 'success');
  });

  it('sets an error and returns false when the request fails', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('Boom'));
    const { result } = renderHook(() => useSettings());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.save({ url: '/api/x', method: 'post' });
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('Boom');
    expect(addToast).toHaveBeenCalledWith('Boom', 'error');
  });

  it('sets isLoading while the request is in flight', async () => {
    let resolve: (v: unknown) => void = () => {};
    vi.mocked(apiClient.patch).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }) as never,
    );
    const { result } = renderHook(() => useSettings());

    let savePromise: Promise<boolean>;
    act(() => {
      savePromise = result.current.save({ url: '/api/x' });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolve({ data: {} });
      await savePromise;
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
