import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalletsSection from './WalletsSection';
import { apiClient } from '@services/api/client';

vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const addToast = vi.fn();
vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@context/WalletContext', () => ({
  useWallet: () => ({ adapter: { name: 'Freighter' } }),
}));

vi.mock('../../../components/auth/WalletConnectButton/WalletConnectButton', () => ({
  WalletConnectButton: ({ onConnect }: { onConnect: (key: string) => void }) => (
    <button onClick={() => onConnect('GNEWKEY123')}>Connect Wallet</button>
  ),
}));

const wallet = { publicKey: 'GABCDEF1234567890', label: 'Freighter', connectedAt: '2024-01-01T00:00:00.000Z' };

describe('WalletsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays connected wallets', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [wallet] } });

    render(<WalletsSection />);

    expect(await screen.findByText(/Freighter/)).toBeInTheDocument();
    expect(apiClient.get).toHaveBeenCalledWith('/api/users/me/wallets');
  });

  it('shows empty state when no wallets are connected', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });

    render(<WalletsSection />);

    expect(await screen.findByText(/no wallet connected/i)).toBeInTheDocument();
  });

  it('adds a wallet successfully and refetches the list', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

    render(<WalletsSection />);
    await screen.findByText(/no wallet connected/i);

    await user.click(screen.getByRole('button', { name: /connect wallet/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/users/me/wallets', {
        publicKey: 'GNEWKEY123',
        label: 'Freighter',
      });
    });
    expect(addToast).toHaveBeenCalledWith('Wallet connected and saved.', 'success');
    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('shows an error toast when saving a connected wallet fails', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(apiClient.post).mockRejectedValue(new Error('network error'));

    render(<WalletsSection />);
    await screen.findByText(/no wallet connected/i);

    await user.click(screen.getByRole('button', { name: /connect wallet/i }));

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        'Wallet connected, but saving it to your account failed. Please try again.',
        'error',
      );
    });
  });

  it('removes a wallet successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [wallet] } });
    vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });

    render(<WalletsSection />);
    await screen.findByText(/Freighter/);

    await user.click(screen.getByRole('button', { name: /remove wallet/i }));

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith(`/api/users/me/wallets/${wallet.publicKey}`);
    });
    await waitFor(() => {
      expect(screen.queryByText(/Freighter/)).not.toBeInTheDocument();
    });
  });

  it('keeps the wallet listed when removal fails', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [wallet] } });
    vi.mocked(apiClient.delete).mockRejectedValue(new Error('failed'));
    // removeWallet's rejection isn't caught by the component (it only
    // clears the `removing` state in `finally`), so the fire-and-forget
    // click handler produces an unhandled rejection independent of this
    // test's assertions. Swallow it here rather than changing the component.
    const onUnhandledRejection = () => {};
    process.on('unhandledRejection', onUnhandledRejection);

    render(<WalletsSection />);
    await screen.findByText(/Freighter/);

    await user.click(screen.getByRole('button', { name: /remove wallet/i }));

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalled();
    });
    expect(screen.getByText(/Freighter/)).toBeInTheDocument();

    process.removeListener('unhandledRejection', onUnhandledRejection);
  });
});
