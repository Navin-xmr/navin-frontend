import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import CustomerProfile from './CustomerProfile';

const addToast = vi.fn();
vi.mock('@context/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('../../../../components/auth/WalletConnectButton/WalletConnectButton', () => ({
  WalletConnectButton: ({ onConnect }: { onConnect: (key: string) => void }) => (
    <button onClick={() => onConnect('GNEWKEY123456')}>Connect Wallet</button>
  ),
}));

describe('CustomerProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile form pre-filled with the existing name and a read-only email', () => {
    render(<CustomerProfile />);

    expect(screen.getByRole('heading', { name: 'Customer Profile' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Email Address')).toHaveValue('john.doe@example.com');
    expect(screen.getByLabelText('Email Address')).toBeDisabled();
    expect(screen.getByText('Not Connected')).toBeInTheDocument();
  });

  it('shows a validation error when the phone number is invalid', async () => {
    const user = userEvent.setup();
    render(<CustomerProfile />);

    await user.type(screen.getByLabelText('Phone Number'), '123');

    expect(screen.getByText('Enter a valid phone number.')).toBeInTheDocument();
  });

  it('blocks submission and shows an error toast when required fields are missing', async () => {
    const user = userEvent.setup();
    render(<CustomerProfile />);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText('Delivery address is required.')).toBeInTheDocument();
    expect(addToast).toHaveBeenCalledWith('Please fix the highlighted fields before saving.', 'error');
  });

  it('saves successfully and shows a success toast after filling required fields', async () => {
    const user = userEvent.setup();
    render(<CustomerProfile />);

    await user.type(screen.getByLabelText('Delivery Address'), '123 Main St');

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(addToast).toHaveBeenCalledWith('Profile saved successfully!', 'success');
    vi.useRealTimers();
  });

  it('updates the wallet card once the wallet connects', async () => {
    const user = userEvent.setup();
    render(<CustomerProfile />);

    await user.click(screen.getByText('Connect Wallet'));

    expect(screen.queryByText('Not Connected')).not.toBeInTheDocument();
    expect(screen.getByText(/GNEWKEY1/)).toBeInTheDocument();
  });
});
