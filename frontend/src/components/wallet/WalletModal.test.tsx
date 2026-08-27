import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import WalletModal from './WalletModal';

const useWalletMock = vi.fn();

vi.mock('../../context/WalletContext', () => ({
  useWallet: () => useWalletMock(),
}));

const isAvailableMock = vi.fn();

vi.mock('../../services/stellar/adapters', () => ({
  WALLET_ADAPTERS: [
    { id: 'freighter', name: 'Freighter', isAvailable: () => isAvailableMock('freighter') },
    { id: 'albedo', name: 'Albedo', isAvailable: () => isAvailableMock('albedo') },
  ],
}));

const connectMock = vi.fn();
const disconnectMock = vi.fn();
const closeModalMock = vi.fn();

function baseWalletValue(overrides: Record<string, unknown> = {}) {
  return {
    isModalOpen: true,
    closeModal: closeModalMock,
    connect: connectMock,
    disconnect: disconnectMock,
    publicKey: null,
    isConnecting: false,
    network: 'testnet',
    ...overrides,
  };
}

describe('WalletModal', () => {
  beforeEach(() => {
    connectMock.mockReset();
    disconnectMock.mockReset();
    closeModalMock.mockReset();
    isAvailableMock.mockReset();
    isAvailableMock.mockResolvedValue(true);
  });

  it('renders nothing when the modal is closed', () => {
    useWalletMock.mockReturnValue(baseWalletValue({ isModalOpen: false }));
    render(<WalletModal />);
    expect(screen.queryByText('Connect Wallet')).not.toBeInTheDocument();
  });

  it('lists the available wallet adapters', async () => {
    useWalletMock.mockReturnValue(baseWalletValue());
    render(<WalletModal />);

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    expect(screen.getByText('Freighter')).toBeInTheDocument();
    expect(screen.getByText('Albedo')).toBeInTheDocument();
    await waitFor(() => expect(isAvailableMock).toHaveBeenCalledWith('freighter'));
  });

  it('shows the connected public key and disconnects on click', async () => {
    useWalletMock.mockReturnValue(baseWalletValue({ publicKey: 'GABCDE...WXYZ' }));
    render(<WalletModal />);

    expect(screen.getByText('GABCDE...WXYZ')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Disconnect' }));
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('connects a wallet when clicked', async () => {
    useWalletMock.mockReturnValue(baseWalletValue());
    connectMock.mockResolvedValue(undefined);
    render(<WalletModal />);

    await userEvent.click(screen.getByRole('button', { name: /Freighter/i }));

    await waitFor(() => expect(connectMock).toHaveBeenCalledWith('freighter'));
  });

  it('shows a friendly error message when connecting fails', async () => {
    useWalletMock.mockReturnValue(baseWalletValue());
    connectMock.mockRejectedValue(new Error('User rejected the request'));
    render(<WalletModal />);

    await userEvent.click(screen.getByRole('button', { name: /Freighter/i }));

    expect(
      await screen.findByText('Connection cancelled. Please approve the request in your wallet.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear all errors/i })).toBeInTheDocument();
  });
});
