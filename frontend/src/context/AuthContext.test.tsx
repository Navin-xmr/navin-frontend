import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuthContext } from './AuthContext';

const { mockWalletDisconnect, mockRedirectToLogin } = vi.hoisted(() => ({
  mockWalletDisconnect: vi.fn(),
  mockRedirectToLogin: vi.fn(),
}));

vi.mock('./WalletContext', () => ({
  useWallet: () => ({ disconnect: mockWalletDisconnect }),
}));

vi.mock('../services/auth/sessionRedirect', () => ({
  redirectToLogin: mockRedirectToLogin,
}));

vi.mock('../services/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock('@sentry/react', () => ({
  setUser: vi.fn(),
}));

vi.mock('../services/realtime/realtimeService', () => ({
  realtimeService: {
    disconnect: vi.fn(),
  },
}));

import { apiClient } from '../services/api/client';
import * as Sentry from '@sentry/react';
import { realtimeService } from '../services/realtime/realtimeService';

const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockSetUser = Sentry.setUser as ReturnType<typeof vi.fn>;
const mockRealtimeDisconnect = realtimeService.disconnect as ReturnType<typeof vi.fn>;

function LogoutButton() {
  const { logout } = useAuthContext();
  return (
    <button type="button" onClick={() => void logout()}>
      Sign out
    </button>
  );
}

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <LogoutButton />
    </AuthProvider>,
  );

describe('AuthContext logout (#816)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', 'header.payload.signature');
  });

  it('runs the shared logout routine end to end', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    renderWithProvider();

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(mockRedirectToLogin).toHaveBeenCalledOnce());
    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockRealtimeDisconnect).toHaveBeenCalledOnce();
    expect(mockWalletDisconnect).toHaveBeenCalledOnce();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('still signs the user out locally when the server request fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'));
    renderWithProvider();

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(mockRedirectToLogin).toHaveBeenCalledOnce());
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockRealtimeDisconnect).toHaveBeenCalledOnce();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('redirects only after local cleanup has finished', async () => {
    let tokenAtRedirect: string | null = 'unset';
    mockRedirectToLogin.mockImplementationOnce(() => {
      tokenAtRedirect = localStorage.getItem('authToken');
    });
    mockPost.mockResolvedValueOnce({ data: {} });
    renderWithProvider();

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(mockRedirectToLogin).toHaveBeenCalledOnce());
    expect(tokenAtRedirect).toBeNull();
  });
});
