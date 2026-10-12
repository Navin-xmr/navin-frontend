import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import EscrowStatus from './EscrowStatus';
import type { Settlement } from '@services/api/endpoints/settlements';

const getByShipmentIdMock = vi.fn();

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

describe('EscrowStatus', () => {
  beforeEach(() => {
    getByShipmentIdMock.mockReset();
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

    // The settlement completes on-chain; the parent bumps refreshKey.
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
});
