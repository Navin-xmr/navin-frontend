import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BulkStatusModal from './BulkStatusModal';
import type { BulkStatusModalProps } from './BulkStatusModal';

const renderModal = (props: Partial<BulkStatusModalProps> = {}) => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <BulkStatusModal
      isOpen
      count={3}
      isLoading={false}
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />,
  );
  return { onConfirm, onClose };
};

describe('BulkStatusModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the selected count and defaults to In Transit', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Update Status')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Select new status' })).toHaveValue('IN_TRANSIT');
    expect(screen.getByRole('button', { name: 'Update 3 shipments' })).toBeInTheDocument();
  });

  it('uses singular wording for a single shipment', () => {
    renderModal({ count: 1 });
    expect(screen.getByRole('button', { name: 'Update 1 shipment' })).toBeInTheDocument();
  });

  it('lists every status option', () => {
    renderModal();

    const options = screen.getAllByRole('option');
    expect(options.map((o) => (o as HTMLOptionElement).value)).toEqual([
      'CREATED',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
    ]);
  });

  it('confirms with the default status', async () => {
    const { onConfirm } = renderModal();

    await userEvent.click(screen.getByRole('button', { name: 'Update 3 shipments' }));

    expect(onConfirm).toHaveBeenCalledWith('IN_TRANSIT');
  });

  it('confirms with the newly selected status', async () => {
    const { onConfirm } = renderModal();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Select new status' }), 'DELIVERED');
    await userEvent.click(screen.getByRole('button', { name: 'Update 3 shipments' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('DELIVERED');
  });

  it('calls onClose when Cancel is clicked', async () => {
    const { onClose, onConfirm } = renderModal();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables actions and Escape while loading', () => {
    const { onClose } = renderModal({ isLoading: true });

    expect(screen.getByRole('button', { name: 'Updating…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Escape when not loading', () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
