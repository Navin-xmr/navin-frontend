import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ShortcutsHelpModal from './ShortcutsHelpModal';

describe('ShortcutsHelpModal', () => {
  const shortcuts = [
    { keys: 'Ctrl+K', label: 'Open search' },
    { keys: 'G D', label: 'Go to dashboard' },
  ];

  it('does not render when isOpen is false', () => {
    render(<ShortcutsHelpModal isOpen={false} onClose={vi.fn()} shortcuts={shortcuts} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with its title when open', () => {
    render(<ShortcutsHelpModal isOpen onClose={vi.fn()} shortcuts={shortcuts} />);
    expect(screen.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toHaveAttribute('aria-modal', 'true');
  });

  it('renders each shortcut label and keys', () => {
    render(<ShortcutsHelpModal isOpen onClose={vi.fn()} shortcuts={shortcuts} />);
    shortcuts.forEach(({ keys, label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(keys)).toBeInTheDocument();
    });
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShortcutsHelpModal isOpen onClose={onClose} shortcuts={shortcuts} />);
    await user.click(screen.getByRole('button', { name: 'Close shortcuts help' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShortcutsHelpModal isOpen onClose={onClose} shortcuts={shortcuts} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShortcutsHelpModal isOpen onClose={onClose} shortcuts={shortcuts} />);
    await user.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the dialog content', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShortcutsHelpModal isOpen onClose={onClose} shortcuts={shortcuts} />);
    await user.click(screen.getByText('Open search'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
