import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NetworkBadge from './NetworkBadge';

const useWalletMock = vi.fn();

vi.mock('../../context/WalletContext', () => ({
  useWallet: () => useWalletMock(),
}));

describe('NetworkBadge', () => {
  it.each([
    ['mainnet', 'mainnet'],
    ['testnet', 'testnet'],
  ] as const)('renders the %s network label', (network, label) => {
    useWalletMock.mockReturnValue({ network });

    render(<NetworkBadge />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('uses the success styling for mainnet and warning styling for testnet', () => {
    useWalletMock.mockReturnValue({ network: 'mainnet' });
    const { rerender } = render(<NetworkBadge />);
    expect(screen.getByText('mainnet').parentElement).toHaveClass('text-emerald-300');

    useWalletMock.mockReturnValue({ network: 'testnet' });
    rerender(<NetworkBadge />);
    expect(screen.getByText('testnet').parentElement).toHaveClass('text-amber-300');
  });
});
