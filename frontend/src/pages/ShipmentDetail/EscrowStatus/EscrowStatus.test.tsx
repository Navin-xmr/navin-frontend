import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import EscrowStatus from './EscrowStatus';
import type { Settlement } from '@services/api/endpoints/settlements';
import { WalletContext, type WalletContextValue } from '@context/useWallet';

const getByShipmentIdMock = vi.fn();
const getOnChainShipmentMock = vi.fn();
const releaseOnChainEscrowMock = vi.fn();

vi.mock('@services/api/endpoints/settlements', async () => {
  const actual = await vi.importActual<typeof import('@services/api/endpoints/settlements')>(
    '@services/api/endpoints/settlements'
  );
  return {
    ...actual,
    settlementsApi: {
      getByShipmentId: (...args: unknown[]) => getByShipmentIdMock(...args),
    },
  };
});

vi.mock('@services/soroban', () => ({
  escrowContract: {
    getShipment: (...args: unknown[]) => getOnChainShipmentMock(...args),
    releaseEscrow: (...args: unknown[]) => releaseOnChainEscrowMock(...args),
  },
}));

function makeSettlement(overrides: Partial<Settlement> = {}): Settlement {
  return {
    _id: 'settlement-1',
    createdAt: '2026-08-27T10:00:00.000Z',
    shipmentId: 'ship-1',
    amount: 100,
    token: 'USDC',
    status: 'ESCROWED',
    ...overrides,
  };
}

function makeWalletContext(overrides: Partial<WalletContextValue> = {}): WalletContextValue {
  return {
    adapter: null,
    publicKey: 'GCONNECTEDWALLETPUBLICKEY1234567890',
    isConnecting: false,
    isModalOpen: false,
    network: 'testnet',
    lastAdapterId: 'freighter',
    networkMismatch: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    signTransaction: vi.fn(),
    ...overrides,
  };
}

describe('EscrowStatus', () => {
  beforeEach(() => {
    getByShipmentIdMock.mockReset();
    getOnChainShipmentMock.mockReset();
    releaseOnChainEscrowMock.mockReset();
  });

  it('fetches and shows an empty state when there are no settlements', async () => {
    getByShipmentIdMock.mockResolvedValue([]);
    render(<EscrowStatus shipmentId="ship-1" />);

    expect(await screen.findByText('No Escrow Records')).toBeInTheDocument();
    expect(getByShipmentIdMock).toHaveBeenCalledWith('ship-1');
  });

  it('renders settlement amount, status and transaction link', async () => {
    getByShipmentIdMock.mockResolvedValue([
      makeSettlement({ stellarTxHash: 'a1b2c3d4e5f6a1b2c3d4e5f6' }),
    ]);
    render(<EscrowStatus shipmentId="ship-1" />);

    expect(await screen.findByText('USDC')).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText('ESCROWED')).toBeInTheDocument();

    const link = screen.getByTitle('a1b2c3d4e5f6a1b2c3d4e5f6');
    expect(link).toHaveAttribute(
      'href',
      'https://stellar.expert/explorer/testnet/tx/a1b2c3d4e5f6a1b2c3d4e5f6'
    );
  });

  it('shows the release timestamp when the escrow has been released', async () => {
    getByShipmentIdMock.mockResolvedValue([
      makeSettlement({
        status: 'RELEASED',
        escrowRelease: { releasedAt: '2026-08-20T12:00:00.000Z' },
      }),
    ]);
    render(<EscrowStatus shipmentId="ship-1" />);

    expect(await screen.findByText('RELEASED')).toBeInTheDocument();
    expect(screen.getByText(/Released:/)).toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', async () => {
    getByShipmentIdMock.mockRejectedValue(new Error('network error'));
    render(<EscrowStatus shipmentId="ship-1" />);

    expect(await screen.findByText('Failed to load escrow records.')).toBeInTheDocument();
  });

  it('re-reads escrow state when refreshKey changes, without flashing the skeleton', async () => {
    getByShipmentIdMock.mockResolvedValueOnce([makeSettlement({ status: 'ESCROWED' })]);
    const { rerender } = render(<EscrowStatus shipmentId="ship-1" refreshKey={1} />);
    expect(await screen.findByText('ESCROWED')).toBeInTheDocument();
    expect(getByShipmentIdMock).toHaveBeenCalledTimes(1);

    getByShipmentIdMock.mockResolvedValueOnce([makeSettlement({ status: 'RELEASED' })]);
    rerender(<EscrowStatus shipmentId="ship-1" refreshKey={2} />);

    expect(screen.queryByText('Loading escrow records…')).not.toBeInTheDocument();
    expect(await screen.findByText('RELEASED')).toBeInTheDocument();
    expect(getByShipmentIdMock).toHaveBeenCalledTimes(2);
  });

  it('keeps showing the last known records when a refresh fails', async () => {
    getByShipmentIdMock.mockResolvedValueOnce([makeSettlement({ status: 'ESCROWED' })]);
    const { rerender } = render(<EscrowStatus shipmentId="ship-1" refreshKey={1} />);
    expect(await screen.findByText('ESCROWED')).toBeInTheDocument();

    getByShipmentIdMock.mockRejectedValueOnce(new Error('RPC down'));
    rerender(<EscrowStatus shipmentId="ship-1" refreshKey={2} />);

    await waitFor(() => expect(getByShipmentIdMock).toHaveBeenCalledTimes(2));
    expect(screen.getByText('ESCROWED')).toBeInTheDocument();
    expect(screen.queryByText('Failed to load escrow records.')).not.toBeInTheDocument();
  });

  it('reads on-chain shipment state via escrowContract.getShipment when a wallet is connected', async () => {
    getByShipmentIdMock.mockResolvedValue([]);
    getOnChainShipmentMock.mockResolvedValue({
      id: 1n,
      sender: 'GSENDER',
      receiver: 'GRECEIVER',
      carrier: 'GCARRIER',
      status: 'InTransit',
      data_hash: new Uint8Array(32),
      created_at: 1700000000n,
      updated_at: 1700000100n,
      escrow_amount: 25000000n,
      total_escrow: 50000000n,
      deadline: 1700086400n,
      integration_nonce: 1,
      finalized: false,
    });

    render(
      <WalletContext.Provider value={makeWalletContext()}>
        <EscrowStatus shipmentId="ship-1" />
      </WalletContext.Provider>,
    );

    expect(await screen.findByText('InTransit')).toBeInTheDocument();
    expect(screen.getByText('25000000 / 50000000 stroops')).toBeInTheDocument();
    expect(getOnChainShipmentMock).toHaveBeenCalledWith('ship-1');
  });

  it('displays on-chain error state when escrowContract.getShipment fails for a connected wallet', async () => {
    getByShipmentIdMock.mockResolvedValue([]);
    getOnChainShipmentMock.mockRejectedValue(
      new Error('ShipmentNotFound (#4): Shipment ID does not exist on-chain.'),
    );

    render(
      <WalletContext.Provider value={makeWalletContext()}>
        <EscrowStatus shipmentId="ship-404" />
      </WalletContext.Provider>,
    );

    expect(
      await screen.findByText('ShipmentNotFound (#4): Shipment ID does not exist on-chain.'),
    ).toBeInTheDocument();
  });

  it('releases on-chain escrow via wallet signTransaction when shipment is Delivered with escrow balance', async () => {
    const signTransaction = vi.fn(async (xdr: string) => xdr);
    getByShipmentIdMock.mockResolvedValue([]);
    getOnChainShipmentMock
      .mockResolvedValueOnce({
        id: 1n,
        sender: 'GSENDER',
        receiver: 'GCONNECTEDWALLETPUBLICKEY1234567890',
        carrier: 'GCARRIER',
        status: 'Delivered',
        data_hash: new Uint8Array(32),
        created_at: 1700000000n,
        updated_at: 1700000100n,
        escrow_amount: 25000000n,
        total_escrow: 25000000n,
        deadline: 1700086400n,
        integration_nonce: 1,
        finalized: false,
      })
      .mockResolvedValueOnce({
        id: 1n,
        sender: 'GSENDER',
        receiver: 'GCONNECTEDWALLETPUBLICKEY1234567890',
        carrier: 'GCARRIER',
        status: 'Delivered',
        data_hash: new Uint8Array(32),
        created_at: 1700000000n,
        updated_at: 1700000200n,
        escrow_amount: 0n,
        total_escrow: 25000000n,
        deadline: 1700086400n,
        integration_nonce: 1,
        finalized: true,
      });
    releaseOnChainEscrowMock.mockResolvedValue('abcdef1234567890abcdef1234567890');

    render(
      <WalletContext.Provider value={makeWalletContext({ signTransaction })}>
        <EscrowStatus shipmentId="ship-1" />
      </WalletContext.Provider>,
    );

    const releaseBtn = await screen.findByRole('button', { name: /release on-chain escrow/i });
    fireEvent.click(releaseBtn);

    await waitFor(() =>
      expect(releaseOnChainEscrowMock).toHaveBeenCalledWith(
        'GCONNECTEDWALLETPUBLICKEY1234567890',
        'ship-1',
        {
          publicKey: 'GCONNECTEDWALLETPUBLICKEY1234567890',
          signTransaction,
        },
      ),
    );
    expect(await screen.findByText(/abcdef\.\.\.7890/)).toBeInTheDocument();
  });
});
