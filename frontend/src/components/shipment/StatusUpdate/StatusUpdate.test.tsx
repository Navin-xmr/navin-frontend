import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StatusUpdate from './StatusUpdate';

describe('StatusUpdate', () => {
  it('shows a dropdown with five milestone options', () => {
    render(<StatusUpdate shipmentId="1234" />);

    fireEvent.click(screen.getByRole('button', { name: /update status for shipment 1234/i }));

    expect(screen.getByRole('listbox', { name: /shipment milestones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Picked Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'In Transit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'At Checkpoint' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Out for Delivery' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delivered' })).toBeInTheDocument();
  });

  it('opens confirmation dialog and closes on cancel', () => {
    const onStatusUpdate = vi.fn().mockResolvedValue(undefined);

    render(<StatusUpdate shipmentId="1234" onStatusUpdate={onStatusUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /update status for shipment 1234/i }));
    fireEvent.click(screen.getByRole('button', { name: 'In Transit' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Update shipment #1234 to In Transit?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onStatusUpdate).not.toHaveBeenCalled();
  });

  it('confirms status update and shows success feedback', async () => {
    const onStatusUpdate = vi.fn().mockResolvedValue(undefined);

    render(<StatusUpdate shipmentId="1234" onStatusUpdate={onStatusUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /update status for shipment 1234/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Delivered' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(onStatusUpdate).toHaveBeenCalledWith('1234', 'Delivered');
    });

    expect(screen.getByRole('status')).toHaveTextContent('Shipment #1234 updated to Delivered.');
  });

  it('shows error feedback when update fails', async () => {
    const onStatusUpdate = vi.fn().mockRejectedValue(new Error('Could not update shipment'));

    render(<StatusUpdate shipmentId="1234" onStatusUpdate={onStatusUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /update status for shipment 1234/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Out for Delivery' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Could not update shipment');
    });
  });
});
