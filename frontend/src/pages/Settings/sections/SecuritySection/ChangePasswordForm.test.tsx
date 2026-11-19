import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangePasswordForm from './ChangePasswordForm';
import { PASSWORD_MIN_LENGTH } from '../../../utils/passwordPolicy';

// Mock useSettings hook
const mockSave = vi.fn();
const mockUseSettings = vi.fn();

vi.mock('../../hooks/useSettings', () => ({
  useSettings: (...args: unknown[]) => mockUseSettings(...args),
}));

// Mock PasswordStrengthMeter if it exists
vi.mock('../../../../components/PasswordStrengthMeter', () => ({
  default: ({ password }: { password: string }) => (
    <div data-testid="password-strength-meter">{password}</div>
  ),
}));

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockResolvedValue(undefined);
    mockUseSettings.mockReturnValue({
      isLoading: false,
      error: null,
      success: null,
      save: mockSave,
    });
  });

  const fillForm = async (current: string, next: string, confirm: string) => {
    const user = userEvent.setup();
    const currentInput = screen.getByLabelText(/current password/i);
    const newInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/confirm/i);

    if (current) await user.type(currentInput, current);
    if (next) await user.type(newInput, next);
    if (confirm) await user.type(confirmInput, confirm);
  };

  it('renders the three password fields', () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm/i)).toBeInTheDocument();
  });

  it('toggles show/hide for password fields', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const currentInput = screen.getByLabelText(/current password/i) as HTMLInputElement;
    expect(currentInput.type).toBe('password');

    const showButtons = screen.getAllByRole('button', { name: /show/i });
    expect(showButtons.length).toBeGreaterThan(0);

    await user.click(showButtons[0]);
    expect(currentInput.type).toBe('text');

    const hideButtons = screen.getAllByRole('button', { name: /hide/i });
    await user.click(hideButtons[0]);
    expect(currentInput.type).toBe('password');
  });

  it('shows min length alert and disables submit when new password is too short', async () => {
    render(<ChangePasswordForm />);

    const shortPassword = 'a'.repeat(PASSWORD_MIN_LENGTH - 1);
    await fillForm('currentPass123', shortPassword, shortPassword);

    expect(
      screen.getByText(new RegExp(`at least ${PASSWORD_MIN_LENGTH} characters`, 'i')),
    ).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /change password|save|update/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows mismatch alert and disables submit when passwords do not match', async () => {
    render(<ChangePasswordForm />);

    const validPassword = 'a'.repeat(PASSWORD_MIN_LENGTH + 2);
    await fillForm('currentPass123', validPassword, validPassword + 'x');

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /change password|save|update/i });
    expect(submitButton).toBeDisabled();
  });

  it('calls save with correct payload on successful submit', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const currentPassword = 'currentPass123';
    const newPassword = 'a'.repeat(PASSWORD_MIN_LENGTH + 2);
    await fillForm(currentPassword, newPassword, newPassword);

    const submitButton = screen.getByRole('button', { name: /change password|save|update/i });
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        url: '/auth/password',
        payload: {
          currentPassword,
          newPassword,
        },
      });
    });
  });

  it('blocks submit when fields are empty', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const submitButton = screen.getByRole('button', { name: /change password|save|update/i });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('displays error message from useSettings', () => {
    mockUseSettings.mockReturnValue({
      isLoading: false,
      error: 'Something went wrong',
      success: null,
      save: mockSave,
    });

    render(<ChangePasswordForm />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('displays success message from useSettings', () => {
    mockUseSettings.mockReturnValue({
      isLoading: false,
      error: null,
      success: 'Password updated successfully',
      save: mockSave,
    });

    render(<ChangePasswordForm />);

    expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
  });

  it('disables submit while loading', () => {
    mockUseSettings.mockReturnValue({
      isLoading: true,
      error: null,
      success: null,
      save: mockSave,
    });

    render(<ChangePasswordForm />);

    const submitButton = screen.getByRole('button', { name: /change password|save|update/i });
    expect(submitButton).toBeDisabled();
  });
});