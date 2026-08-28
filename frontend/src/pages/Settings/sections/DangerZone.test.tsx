import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DangerZone from './DangerZone';
import { apiClient } from '@services/api/client';

vi.mock('@services/api/client', () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

const addToast = vi.fn();
vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

const USER_EMAIL = 'user@example.com';

describe('DangerZone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { location?: unknown }).location;
    (window as unknown as { location: { href: string } }).location = { href: '' };
    localStorage.clear();
  });

  it('keeps the delete button disabled until the confirmation email matches exactly', async () => {
    const user = userEvent.setup();
    render(<DangerZone userEmail={USER_EMAIL} />);

    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    const input = screen.getByPlaceholderText(USER_EMAIL);

    expect(deleteButton).toBeDisabled();

    await user.type(input, 'wrong@example.com');
    expect(deleteButton).toBeDisabled();

    await user.clear(input);
    await user.type(input, USER_EMAIL);
    expect(deleteButton).toBeEnabled();
  });

  it('does not call the delete endpoint when the confirmation is mismatched', async () => {
    const user = userEvent.setup();
    render(<DangerZone userEmail={USER_EMAIL} />);

    await user.type(screen.getByPlaceholderText(USER_EMAIL), 'wrong@example.com');
    await user.click(screen.getByRole('button', { name: /delete account/i }));

    expect(apiClient.delete).not.toHaveBeenCalled();
  });

  it('deletes the account and redirects on a successful confirmed delete', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });
    localStorage.setItem('authToken', 'token-123');

    render(<DangerZone userEmail={USER_EMAIL} />);

    await user.type(screen.getByPlaceholderText(USER_EMAIL), USER_EMAIL);
    await user.click(screen.getByRole('button', { name: /delete account/i }));

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/api/users/me');
    });
    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBeNull();
    });
    expect(window.location.href).toBe('/');
  });

  it('shows an error and does not redirect when the delete request fails', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'));

    render(<DangerZone userEmail={USER_EMAIL} />);

    await user.type(screen.getByPlaceholderText(USER_EMAIL), USER_EMAIL);
    await user.click(screen.getByRole('button', { name: /delete account/i }));

    expect(await screen.findByText('Delete failed')).toBeInTheDocument();
    expect(window.location.href).toBe('');
  });

  it('exports data successfully via the export button', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.get).mockResolvedValue({ data: new Blob(['{}']) });
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();

    render(<DangerZone userEmail={USER_EMAIL} />);

    await user.click(screen.getByRole('button', { name: /export my data/i }));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/api/users/me/export', { responseType: 'blob' });
    });
    expect(addToast).toHaveBeenCalledWith('Your data export has started downloading.', 'success');
  });

  it('shows an error toast when export fails', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.get).mockRejectedValue(new Error('export failed'));

    render(<DangerZone userEmail={USER_EMAIL} />);

    await user.click(screen.getByRole('button', { name: /export my data/i }));

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith('Could not export your data. Please try again.', 'error');
    });
  });
});
