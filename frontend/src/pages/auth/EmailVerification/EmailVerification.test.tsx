import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EmailVerification from './EmailVerification';
import { ToastProvider } from '../../../context/ToastContext';
import { LiveRegionProvider } from '../../../context/LiveRegionContext';

vi.mock('../../../services/api', () => ({
  authApi: {
    resendVerification: vi.fn(),
  },
}));

import { authApi } from '../../../services/api';

const mockAuthApi = authApi as unknown as { resendVerification: ReturnType<typeof vi.fn> };

const renderComponent = (state?: { email?: string }) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/register/verify-email', state }]}>
      <LiveRegionProvider>
        <ToastProvider>
          <Routes>
            <Route path="/register/verify-email" element={<EmailVerification />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </ToastProvider>
      </LiveRegionProvider>
    </MemoryRouter>
  );

describe('EmailVerification Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email from location.state and allows resending', async () => {
    mockAuthApi.resendVerification.mockResolvedValueOnce({});
    renderComponent({ email: 'test@example.com' });

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    const resendBtn = screen.getByRole('button', { name: /resend/i });
    expect(resendBtn).toBeInTheDocument();

    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(mockAuthApi.resendVerification).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  it('renders email input prompt when opened directly with undefined location.state', async () => {
    mockAuthApi.resendVerification.mockResolvedValueOnce({});
    renderComponent(undefined);

    const input = screen.getByLabelText(/email address/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'direct@example.com' } });
    const resendBtn = screen.getByRole('button', { name: /resend/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(mockAuthApi.resendVerification).toHaveBeenCalledWith({ email: 'direct@example.com' });
    });
  });

  it('activates cooldown countdown on resend', async () => {
    vi.useFakeTimers();
    mockAuthApi.resendVerification.mockResolvedValueOnce({});
    renderComponent({ email: 'test@example.com' });

    const resendBtn = screen.getByRole('button', { name: /resend/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(mockAuthApi.resendVerification).toHaveBeenCalledTimes(1);
    });

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole('button', { name: /resend/i })).toBeDisabled();
    vi.useRealTimers();
  });
});
