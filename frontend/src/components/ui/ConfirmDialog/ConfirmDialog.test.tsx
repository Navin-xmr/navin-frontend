import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    onConfirm: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when isOpen is false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Are you sure you want to delete this item?'),
    ).not.toBeInTheDocument();
  });

  it('renders title, message, and default Confirm label when open', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this item?'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirm' }),
    ).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape key press', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when isLoading is true', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ConfirmDialog {...defaultProps} onClose={onClose} isLoading={true} />,
    );

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on backdrop click but not when clicking inside the dialog', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

    const dialog = screen.getByRole('dialog');
    await user.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    const backdrop = dialog.parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons and shows the spinner when isLoading is true', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the custom confirmLabel', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Delete" />);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Confirm' }),
    ).not.toBeInTheDocument();
  });

  describe('focus trap', () => {
    it('lands initial focus on the Cancel button (first focusable)', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });

    it('wraps Tab from the last focusable (confirm button) to the first', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      confirmButton.focus();
      expect(confirmButton).toHaveFocus();

      await user.tab();

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });

    it('wraps Shift+Tab from the first focusable to the last', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      cancelButton.focus();
      expect(cancelButton).toHaveFocus();

      await user.tab({ shift: true });

      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
    });
  });
});