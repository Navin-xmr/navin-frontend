import { useState, type ComponentProps } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Settlement, SettlementDetail } from '@services/api/endpoints/settlements';
import SettlementDetailModal from './SettlementDetailModal';

const settlement: Settlement = {
  _id: 'settlement-1',
  shipmentId: 'SHIP-101',
  createdAt: '2026-02-01T10:00:00Z',
  amount: 2500.5,
  token: 'USDC',
  status: 'RELEASED',
  stellarTxHash: '0123456789abcdef'.repeat(4),
  payerAddress: 'G-PAYER-ADDRESS',
  payeeAddress: 'G-PAYEE-ADDRESS',
  escrowRelease: {
    conditionDescription: 'Release funds after proof of delivery is verified.',
    releasedAt: '2026-02-02T11:00:00Z',
  },
};

const detail: SettlementDetail = {
  settlement: {
    ...settlement,
    _id: 'settlement-detail',
    shipmentId: 'SHIP-202',
    amount: 3500,
    status: 'DISPUTED',
    stellarTxHash: 'fedcba9876543210'.repeat(4),
    payerAddress: 'G-DETAIL-PAYER',
    payeeAddress: 'G-DETAIL-PAYEE',
    escrowRelease: {
      conditionDescription: 'Confirm delivery and recipient signature.',
      disputedAt: '2026-02-03T12:00:00Z',
      disputeReason: 'Delivery evidence is incomplete.',
    },
  },
};

type ModalProps = ComponentProps<typeof SettlementDetailModal>;

function renderModal(overrides: Partial<ModalProps> = {}) {
  const props: ModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    settlement,
    detail: null,
    ...overrides,
  };
  return { ...render(<SettlementDetailModal {...props} />), onClose: props.onClose };
}

function expectField(dialog: HTMLElement, label: string, value: string) {
  const row = within(dialog).getByText(label).parentElement as HTMLElement;
  expect(within(row).getByText(value)).toBeInTheDocument();
}

describe('SettlementDetailModal', () => {
  it('displays settlement amounts, status, transaction, escrow conditions, and parties', () => {
    renderModal();
    const dialog = screen.getByRole('dialog', { name: 'Escrow Details' });
    const hash = settlement.stellarTxHash as string;

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expectField(dialog, 'Shipment', 'SHIP-101');
    expectField(dialog, 'Amount', '2,500.5 USDC');
    expectField(dialog, 'Status', 'RELEASED');
    expectField(dialog, 'Stellar Tx', `${hash.slice(0, 12)}...${hash.slice(-8)}`);
    expect(within(dialog).getByText('Release funds after proof of delivery is verified.')).toBeInTheDocument();
    expectField(dialog, 'Released at', '2026-02-02T11:00:00Z');
    expectField(dialog, 'Disputed at', '-');
    expectField(dialog, 'Dispute reason', '-');
    expectField(dialog, 'Payer', 'G-PAYER-ADDRESS');
    expectField(dialog, 'Payee', 'G-PAYEE-ADDRESS');

    const verificationLink = within(dialog).getByRole('link', { name: 'Verify on Blockchain' });
    expect(verificationLink).toHaveAttribute('href', `https://stellar.expert/explorer/testnet/tx/${hash}`);
    expect(verificationLink).toHaveAttribute('target', '_blank');
    expect(verificationLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('prefers the detailed settlement response over the list data', () => {
    renderModal({ detail });
    const dialog = screen.getByRole('dialog', { name: 'Escrow Details' });

    expectField(dialog, 'Shipment', 'SHIP-202');
    expectField(dialog, 'Amount', '3,500 USDC');
    expectField(dialog, 'Status', 'DISPUTED');
    expect(within(dialog).getByText('Confirm delivery and recipient signature.')).toBeInTheDocument();
    expectField(dialog, 'Released at', '-');
    expectField(dialog, 'Disputed at', '2026-02-03T12:00:00Z');
    expectField(dialog, 'Dispute reason', 'Delivery evidence is incomplete.');
    expectField(dialog, 'Payer', 'G-DETAIL-PAYER');
    expectField(dialog, 'Payee', 'G-DETAIL-PAYEE');
    expect(within(dialog).queryByText('SHIP-101')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('2,500.5 USDC')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Verify on Blockchain' })).toHaveAttribute(
      'href', `https://stellar.expert/explorer/testnet/tx/${detail.settlement.stellarTxHash}`,
    );
  });

  it('can display detail data even when there is no list settlement', () => {
    renderModal({ settlement: null, detail });

    expectField(screen.getByRole('dialog', { name: 'Escrow Details' }), 'Shipment', 'SHIP-202');
  });

  it('shows placeholders for omitted optional information and hides the verification link', () => {
    renderModal({
      settlement: {
        ...settlement,
        stellarTxHash: undefined,
        payerAddress: undefined,
        payeeAddress: undefined,
        escrowRelease: undefined,
      },
    });
    const dialog = screen.getByRole('dialog', { name: 'Escrow Details' });

    for (const label of ['Stellar Tx', 'Released at', 'Disputed at', 'Dispute reason', 'Payer', 'Payee']) {
      expectField(dialog, label, '-');
    }
    expect(within(dialog).getByText('Release conditions').nextElementSibling).toHaveTextContent('-');
    expect(within(dialog).queryByRole('link', { name: 'Verify on Blockchain' })).not.toBeInTheDocument();
  });

  it('shows the loading message instead of settlement details while loading', () => {
    renderModal({ isLoading: true });
    const dialog = screen.getByRole('dialog', { name: 'Escrow Details' });

    expect(within(dialog).getByText('Loading escrow information...')).toBeInTheDocument();
    expect(within(dialog).queryByText('SHIP-101')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Release conditions')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeEnabled();
  });

  it('does not render when the modal is closed', () => {
    renderModal({ isOpen: false, detail });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Escrow Details')).not.toBeInTheDocument();
  });

  it('does not render without either a settlement or detail data', () => {
    renderModal({ settlement: null, detail: null });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['footer button', 'header button', 'Escape', 'overlay'] as const)(
    'closes the modal through the %s',
    async (closeMethod) => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      function DismissibleModal() {
        const [isOpen, setIsOpen] = useState(true);
        return (
          <SettlementDetailModal
            isOpen={isOpen}
            settlement={settlement}
            detail={detail}
            onClose={() => {
              onClose();
              setIsOpen(false);
            }}
          />
        );
      }
      const { container } = render(<DismissibleModal />);
      expect(screen.getByRole('dialog', { name: 'Escrow Details' })).toBeInTheDocument();

      if (closeMethod === 'footer button') {
        await user.click(screen.getByRole('button', { name: 'Close' }));
      } else if (closeMethod === 'header button') {
        await user.click(screen.getByRole('button', { name: 'Close modal' }));
      } else if (closeMethod === 'Escape') {
        await user.keyboard('{Escape}');
      } else {
        const overlay = container.querySelector('[role="presentation"]')?.firstElementChild as HTMLElement;
        await user.click(overlay);
      }

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
  );

  it('does not close when the dialog content is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByText('Release conditions'));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Escrow Details' })).toBeInTheDocument();
  });
});
