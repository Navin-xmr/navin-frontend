import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  };

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('displays the title', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<Modal {...defaultProps}><div>Custom content</div></Modal>);
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(<Modal {...defaultProps} footer={<button>Save</button>} />);
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(within(dialog).getByRole('button', { name: 'Save', hidden: true })).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    render(<Modal {...defaultProps} />);
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(within(dialog).queryByRole('button', { name: 'Save', hidden: true })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByLabelText('Close modal');
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked with closeOnOverlayClick', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick />);
    const overlays = document.querySelectorAll('[aria-hidden="true"]');
    const overlay = overlays[1];
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on overlay click when closeOnOverlayClick is false', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);
    const overlays = document.querySelectorAll('[aria-hidden="true"]');
    const overlay = overlays[1];
    await user.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key when closeOnEsc is true', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnEsc />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has correct aria attributes', () => {
    render(<Modal {...defaultProps} />);
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)(
      'renders with %s size',
      (size) => {
        render(<Modal {...defaultProps} size={size} />);
        expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      }
    );
  });
});
