import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ShipmentDetailHeader from './ShipmentDetailHeader';

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('../ShareQRCodeModal/ShareQRCodeModal', () => ({
  default: ({ isOpen, trackingNumber }: { isOpen: boolean; trackingNumber: string }) =>
    isOpen ? <div>QR modal for {trackingNumber}</div> : null,
}));

const baseProps = {
  shipmentId: 'SHP-100',
  trackingNumber: 'TRK-999',
  status: 'IN_TRANSIT',
  expectedDeliveryDate: '2026-12-01T00:00:00.000Z',
};

describe('ShipmentDetailHeader', () => {
  it('renders shipment identity and status for a customer view', () => {
    render(<ShipmentDetailHeader {...baseProps} userRole="customer" />);

    expect(screen.getByRole('heading', { name: 'SHP-100' })).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('TRK-999')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Track shipment' })).toBeInTheDocument();
    expect(screen.queryByText('Update Status')).not.toBeInTheDocument();
  });

  it('shows the update status action and priority menu for a company view', async () => {
    const user = userEvent.setup();
    const onUpdatePriority = vi.fn();
    render(
      <ShipmentDetailHeader
        {...baseProps}
        userRole="company"
        priority="STANDARD"
        onUpdatePriority={onUpdatePriority}
      />,
    );

    expect(screen.getByText('Update Status')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Change priority'));
    await user.click(screen.getByText('Urgent'));

    expect(onUpdatePriority).toHaveBeenCalledWith('URGENT');
  });

  it('shows a Raise Dispute action only once the shipment is delivered', () => {
    const onRaiseDispute = vi.fn();
    const { rerender } = render(
      <ShipmentDetailHeader {...baseProps} userRole="customer" onRaiseDispute={onRaiseDispute} />,
    );
    expect(screen.queryByRole('button', { name: 'Raise dispute' })).not.toBeInTheDocument();

    rerender(
      <ShipmentDetailHeader
        {...baseProps}
        status="DELIVERED"
        userRole="customer"
        onRaiseDispute={onRaiseDispute}
      />,
    );
    expect(screen.getByRole('button', { name: 'Raise dispute' })).toBeInTheDocument();
  });

  it('disables the export button and shows a spinner state while exporting', () => {
    render(<ShipmentDetailHeader {...baseProps} userRole="customer" isExporting />);

    const exportButton = screen.getByRole('button', { name: 'Export shipment as PDF' });
    expect(exportButton).toBeDisabled();
    expect(screen.getByText('Exporting...')).toBeInTheDocument();
  });

  it('opens the QR share modal when Share QR Code is clicked', async () => {
    const user = userEvent.setup();
    render(<ShipmentDetailHeader {...baseProps} userRole="customer" />);

    expect(screen.queryByText(/QR modal for/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Share QR Code' }));

    expect(screen.getByText('QR modal for TRK-999')).toBeInTheDocument();
  });

  it('renders origin/destination as plain text for a customer and editable fields for a company', () => {
    const { rerender } = render(
      <ShipmentDetailHeader
        {...baseProps}
        userRole="customer"
        originAddress="Chicago, IL"
        destinationAddress="Houston, TX"
      />,
    );
    expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
    expect(screen.queryByLabelText('Edit field')).not.toBeInTheDocument();

    rerender(
      <ShipmentDetailHeader
        {...baseProps}
        userRole="company"
        originAddress="Chicago, IL"
        destinationAddress="Houston, TX"
      />,
    );
    expect(screen.getAllByLabelText('Edit field').length).toBe(2);
  });
});
