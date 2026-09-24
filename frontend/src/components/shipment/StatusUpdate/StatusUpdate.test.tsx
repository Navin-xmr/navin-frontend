import type { ReactElement } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import StatusUpdate from './StatusUpdate';
import { ToastProvider } from '../../../context/ToastContext';
import { LiveRegionProvider } from '../../../context/LiveRegionContext';

const renderWithProviders = (ui: ReactElement) =>
  render(
    <BrowserRouter>
      <LiveRegionProvider>
        <ToastProvider>{ui}</ToastProvider>
      </LiveRegionProvider>
    </BrowserRouter>,
  );

describe('StatusUpdate', () => {
  it('shows a dropdown with five milestone options', () => {
    renderWithProviders(<StatusUpdate shipmentId="1234" />);

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

    renderWithProviders(<StatusUpdate shipmentId="1234" onStatusUpdate={onStatusUpdate} />);

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

    renderWithProviders(<StatusUpdate shipmentId="1234" onStatusUpdate={onStatusUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /update status for shipment 1234/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Delivered' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(onStatusUpdate).toHaveBeenCalledWith('1234', 'Delivered');
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Shipment #1234 updated to Delivered.');
    });
  });

  it('shows error feedback when update fails', async () => {
    const onStatusUpdate = vi.fn().mockRejectedValue(new Error('Could not update shipment'));

    renderWithProviders(<StatusUpdate shipmentId="1234" onStatusUpdate={onStatusUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /update status for shipment 1234/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Out for Delivery' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    // useOptimisticUpdate deliberately swallows the raw thrown error and
    // surfaces its own configured, user-facing fallback message instead.
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to update shipment status. Changes have been reverted.',
      );
    });
  });
});
