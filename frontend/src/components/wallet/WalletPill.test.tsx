import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import WalletPill from './WalletPill';

const useWalletMock = vi.fn();
const openModalMock = vi.fn();
const disconnectMock = vi.fn();

vi.mock('../../context/WalletContext', () => ({
  useWallet: () => useWalletMock(),
}));

describe('WalletPill', () => {
  it('prompts to connect when no wallet is connected', async () => {
    useWalletMock.mockReturnValue({
      publicKey: null,
      openModal: openModalMock,
      disconnect: disconnectMock,
    });

    render(<WalletPill />);
    await userEvent.click(screen.getByRole('button', { name: 'Connect wallet' }));

    expect(openModalMock).toHaveBeenCalledOnce();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows a truncated public key and disconnect action', async () => {
    const publicKey = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV';
    useWalletMock.mockReturnValue({
      publicKey,
      openModal: openModalMock,
      disconnect: disconnectMock,
    });

    render(<WalletPill />);

    expect(screen.getByText('GABCD…STUV')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Wallet connected: ${publicKey}` })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Disconnect wallet' }));
    expect(disconnectMock).toHaveBeenCalledOnce();
  });
});
