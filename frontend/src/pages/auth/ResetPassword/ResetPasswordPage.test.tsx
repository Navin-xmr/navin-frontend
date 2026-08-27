import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';
import { ToastProvider } from '../../../context/ToastContext';
import { LiveRegionProvider } from '../../../context/LiveRegionContext';

vi.mock('../../../services/api', () => ({
  authApi: {
    resetPassword: vi.fn(),
  },
}));

import { authApi } from '../../../services/api';

const mockAuthApi = authApi as unknown as { resetPassword: ReturnType<typeof vi.fn> };

const renderPage = (initialEntry = '/reset-password?token=valid-token') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LiveRegionProvider>
        <ToastProvider>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </ToastProvider>
      </LiveRegionProvider>
    </MemoryRouter>
  );

const validPassword = 'Str0ng!Pass';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the reset password form', () => {
    renderPage();

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows a validation error for a weak password', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'weak' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(mockAuthApi.resetPassword).not.toHaveBeenCalled();
  });

  it('shows an error when the token is missing', () => {
    renderPage('/reset-password');

    expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();
  });

  it('resets the password successfully and navigates to login', async () => {
    mockAuthApi.resetPassword.mockResolvedValueOnce({});
    renderPage();

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: validPassword } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: validPassword } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(mockAuthApi.resetPassword).toHaveBeenCalledWith({ token: 'valid-token', newPassword: validPassword });
    });
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('shows a server error message when reset fails', async () => {
    mockAuthApi.resetPassword.mockRejectedValueOnce({ response: { status: 400, data: {} } });
    renderPage();

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: validPassword } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: validPassword } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/invalid or expired/i)).toBeInTheDocument();
  });
});
