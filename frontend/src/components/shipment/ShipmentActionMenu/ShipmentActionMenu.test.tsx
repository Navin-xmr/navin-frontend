import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ShipmentActionMenu from './ShipmentActionMenu';

describe('ShipmentActionMenu', () => {
  it('is closed by default and opens the menu when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<ShipmentActionMenu shipmentId="SHP-001" status="IN_TRANSIT" />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Actions for shipment SHP-001' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Mark as Delivered')).toBeInTheDocument();
  });

  it('hides status-specific actions once a shipment is delivered', async () => {
    const user = userEvent.setup();
    render(<ShipmentActionMenu shipmentId="SHP-002" status="DELIVERED" />);

    await user.click(screen.getByRole('button', { name: 'Actions for shipment SHP-002' }));

    expect(screen.queryByText('Update Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Mark as Delivered')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel Shipment')).not.toBeInTheDocument();
    expect(screen.getByText('Download Documents')).toBeInTheDocument();
  });

  it('invokes the matching handler with the shipment id and closes the menu', async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    render(<ShipmentActionMenu shipmentId="SHP-003" status="CREATED" onViewDetails={onViewDetails} />);

    await user.click(screen.getByRole('button', { name: 'Actions for shipment SHP-003' }));
    await user.click(screen.getByText('View Details'));

    expect(onViewDetails).toHaveBeenCalledWith('SHP-003');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<ShipmentActionMenu shipmentId="SHP-004" status="CREATED" />);

    await user.click(screen.getByRole('button', { name: 'Actions for shipment SHP-004' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
