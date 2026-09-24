import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PaymentStatus, { type PaymentData } from './PaymentStatus';

const payment: PaymentData = {
  amount: '250.00',
  tokenSymbol: 'USDC',
  status: 'escrowed',
  payerAddress: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  payeeAddress: 'GZYXWVUTSRQPONMLKJIHGFEDCBA654321',
  transactionHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
};

describe('PaymentStatus', () => {
  it('renders the empty state when there is no payment', () => {
    render(<PaymentStatus payment={null} />);
    expect(screen.getByText('Payment Not Yet Initiated')).toBeInTheDocument();
  });

  it('renders payment amount, status and truncated addresses', () => {
    render(<PaymentStatus payment={payment} />);

    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(screen.getByText(/250\.00/)).toBeInTheDocument();
    expect(screen.getByText('Escrowed')).toBeInTheDocument();
    expect(screen.getByTitle(payment.payerAddress)).toHaveTextContent('GABCDE...3456');
    expect(screen.getByTitle(payment.payeeAddress)).toHaveTextContent('GZYXWV...4321');
  });

  it('links the transaction hash to the Stellar explorer', () => {
    render(<PaymentStatus payment={payment} />);

    const link = screen.getByTitle(payment.transactionHash);
    expect(link).toHaveAttribute(
      'href',
      `https://stellar.expert/explorer/testnet/tx/${payment.transactionHash}`
    );
  });

  it('shows tokenization details only when provided', () => {
    const { rerender } = render(<PaymentStatus payment={payment} />);
    expect(screen.queryByText('Stellar Token ID')).not.toBeInTheDocument();

    rerender(
      <PaymentStatus
        payment={{ ...payment, stellarTokenId: 'token-123456789', stellarTxHash: 'tx-hash-987654321' }}
      />
    );
    expect(screen.getByText('Stellar Token ID')).toBeInTheDocument();
    expect(screen.getByText('Tokenization Tx')).toBeInTheDocument();
  });
});
