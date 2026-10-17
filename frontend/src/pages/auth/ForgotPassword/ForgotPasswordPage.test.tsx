import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPasswordPage from './ForgotPasswordPage';

const authApi = vi.hoisted(() => ({
  forgotPassword: vi.fn(),
}));

vi.mock('../../../services/api', () => ({
  authApi,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    renderWithRouter(<ForgotPasswordPage />);

    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  });

  it('validates email is required', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    // Focus and blur without entering anything
    await user.click(emailInput);
    await user.tab();

    expect(await screen.findByRole('alert')).toHaveTextContent(/email.+required/i);

    // Try submitting
    await user.click(submitButton);
    expect(authApi.forgotPassword).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);

    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    expect(await screen.findByRole('alert')).toHaveTextContent(/email.+invalid/i);
  });

  it('accepts valid email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);

    // Enter valid email
    await user.type(emailInput, 'user@example.com');
    await user.tab();

    // Should not show error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('submits the form with valid email and shows success confirmation', async () => {
    authApi.forgotPassword.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    // Enter valid email
    await user.type(emailInput, 'user@example.com');
    await user.click(submitButton);

    // Should show loading state
    expect(await screen.findByText(/submitting/i)).toBeInTheDocument();

    // Wait for API call
    await waitFor(() => {
      expect(authApi.forgotPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
    });

    // Should show success confirmation
    expect(await screen.findByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    expect(screen.getByText(/sent.+reset.+link/i)).toBeInTheDocument();
  });

  it('shows success confirmation even when API fails for security', async () => {
    authApi.forgotPassword.mockRejectedValue(new Error('User not found'));
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    // Enter email
    await user.type(emailInput, 'nonexistent@example.com');
    await user.click(submitButton);

    // Should still show success to prevent email enumeration
    expect(await screen.findByRole('heading', { name: /check your email/i })).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    authApi.forgotPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'user@example.com');
    await user.click(submitButton);

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();
  });

  it('allows returning to login from success page', async () => {
    authApi.forgotPassword.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    // Wait for success screen
    await screen.findByRole('heading', { name: /check your email/i });

    // Should have link back to login
    const backLink = screen.getByRole('link', { name: /back to login/i });
    expect(backLink).toHaveAttribute('href', '/login');
  });

  it('clears error when user starts typing after validation error', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);

    // Enter invalid email and trigger validation
    await user.type(emailInput, 'invalid');
    await user.tab();
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Start correcting the email
    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');

    // Error should clear
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
