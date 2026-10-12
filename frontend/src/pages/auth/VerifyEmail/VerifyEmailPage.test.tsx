import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import VerifyEmailPage from './VerifyEmailPage';
import { ToastProvider } from '../../../context/ToastContext';
import { LiveRegionProvider } from '../../../context/LiveRegionContext';

vi.mock('../../../services/api', () => ({
  authApi: {
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
  },
}));

import { authApi } from '../../../services/api';

const mockAuthApi = authApi as unknown as {
  verifyEmail: ReturnType<typeof vi.fn>;
  resendVerification: ReturnType<typeof vi.fn>;
};

const renderPage = (initialEntry = '/verify-email?token=valid-token') => {
  let currentLocation: { pathname: string; search: string } | null = null;
  const LocationWatcher = () => {
    const loc = useLocation();
    currentLocation = loc;
    return null;
  };

  const utils = render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LiveRegionProvider>
        <ToastProvider>
          <LocationWatcher />
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </ToastProvider>
      </LiveRegionProvider>
    </MemoryRouter>
  );

  return { ...utils, getLocation: () => currentLocation };
};

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies the token, strips it from URL, and shows success state', async () => {
    mockAuthApi.verifyEmail.mockResolvedValueOnce({});
    const { getLocation } = renderPage('/verify-email?token=test-token-xyz');

    await waitFor(() => {
      expect(mockAuthApi.verifyEmail).toHaveBeenCalledWith({ token: 'test-token-xyz' });
    });

    expect(await screen.findByText(/email verified successfully/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /proceed to login/i })).toBeInTheDocument();

    // Verify token was stripped from URL
    expect(getLocation()?.search).toBe('');
  });

  it('shows expired / invalid state when verification fails and allows resending', async () => {
    mockAuthApi.verifyEmail.mockRejectedValueOnce({
      response: { data: { message: 'Token has expired' } },
    });
    mockAuthApi.resendVerification.mockResolvedValueOnce({});

    renderPage('/verify-email?token=expired-token');

    expect(await screen.findByText('Token has expired')).toBeInTheDocument();

    const input = screen.getByLabelText(/email address/i);
    fireEvent.change(input, { target: { value: 'user@example.com' } });

    const resendBtn = screen.getByRole('button', { name: /resend/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(mockAuthApi.resendVerification).toHaveBeenCalledWith({ email: 'user@example.com' });
    });
  });

  it('shows missing token notice when accessed without token', async () => {
    renderPage('/verify-email');

    expect(await screen.findByText(/missing verification link/i)).toBeInTheDocument();
    expect(mockAuthApi.verifyEmail).not.toHaveBeenCalled();
  });
});
