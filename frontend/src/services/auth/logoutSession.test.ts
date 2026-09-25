import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logoutSession } from './logoutSession';

vi.mock('../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock('@sentry/react', () => ({
  setUser: vi.fn(),
}));

vi.mock('../realtime/realtimeService', () => ({
  realtimeService: {
    disconnect: vi.fn(),
  },
}));

import { apiClient } from '../api/client';
import * as Sentry from '@sentry/react';
import { realtimeService } from '../realtime/realtimeService';

const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockSetUser = Sentry.setUser as ReturnType<typeof vi.fn>;
const mockDisconnect = realtimeService.disconnect as ReturnType<typeof vi.fn>;

describe('logoutSession (#816)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', 'jwt-token-001');
  });

  it('notifies the server, clears the token and Sentry user, and closes the real-time connection', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await logoutSession();

    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });

  it('resolves and still cleans up when the server request fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'));

    await expect(logoutSession()).resolves.toBeUndefined();

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });

  it('skips the server request but still cleans up when notifyServer is false', async () => {
    await logoutSession({ notifyServer: false });

    expect(mockPost).not.toHaveBeenCalled();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
