import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletConnectButton } from './WalletConnectButton';

const openModal = vi.fn();
const disconnect = vi.fn();
let walletState: { publicKey: string | null; isConnecting: boolean };

vi.mock('../../../context/WalletContext', () => ({
  useWallet: () => ({ ...walletState, openModal, disconnect }),
}));

const ADDRESS = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPWXYZ';

describe('WalletConnectButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnect.mockResolvedValue(undefined);
    walletState = { publicKey: null, isConnecting: false };
  });

  it('renders the connect button and opens the wallet modal on click', () => {
    render(<WalletConnectButton />);

    const button = screen.getByRole('button', { name: /connect wallet/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);

    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('shows a disabled connecting state while a connection is in progress', () => {
    walletState = { publicKey: null, isConnecting: true };
    render(<WalletConnectButton />);

    const button = screen.getByRole('button', { name: /connecting\.\.\./i });
    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(openModal).not.toHaveBeenCalled();
  });

  it('shows the truncated address and disconnects when connected', () => {
    walletState = { publicKey: ADDRESS, isConnecting: false };
    render(<WalletConnectButton />);

    expect(screen.getByText('GABCD...WXYZ')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /connect wallet/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Disconnect wallet' }));

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('calls onConnect when the wallet becomes connected', () => {
    const onConnect = vi.fn();
    const { rerender } = render(<WalletConnectButton onConnect={onConnect} />);

    expect(onConnect).not.toHaveBeenCalled();

    walletState = { publicKey: ADDRESS, isConnecting: false };
    rerender(<WalletConnectButton onConnect={onConnect} />);

    expect(onConnect).toHaveBeenCalledWith(ADDRESS);
  });

  it('calls onDisconnect when the wallet becomes disconnected', () => {
    const onDisconnect = vi.fn();
    walletState = { publicKey: ADDRESS, isConnecting: false };
    const { rerender } = render(<WalletConnectButton onDisconnect={onDisconnect} />);

    walletState = { publicKey: null, isConnecting: false };
    rerender(<WalletConnectButton onDisconnect={onDisconnect} />);

    expect(onDisconnect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('returns to the connect state without calling onConnect when a connection attempt fails', () => {
    const onConnect = vi.fn();
    walletState = { publicKey: null, isConnecting: true };
    const { rerender } = render(<WalletConnectButton onConnect={onConnect} />);

    walletState = { publicKey: null, isConnecting: false };
    rerender(<WalletConnectButton onConnect={onConnect} />);

    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeEnabled();
    expect(onConnect).not.toHaveBeenCalled();
  });
});
