import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBulkActionBar from './NotificationBulkActionBar';

describe('NotificationBulkActionBar', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(
      <NotificationBulkActionBar count={0} onMarkRead={vi.fn()} onDelete={vi.fn()} onClear={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the selected count and fires the mark-read, delete, and clear callbacks', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    const onDelete = vi.fn();
    const onClear = vi.fn();

    render(
      <NotificationBulkActionBar count={3} onMarkRead={onMarkRead} onDelete={onDelete} onClear={onClear} />,
    );

    expect(screen.getByText('3 selected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mark as read/i }));
    expect(onMarkRead).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /clear selection/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('disables the action buttons while processing', () => {
    render(
      <NotificationBulkActionBar
        count={2}
        onMarkRead={vi.fn()}
        onDelete={vi.fn()}
        onClear={vi.fn()}
        isProcessing
      />,
    );

    expect(screen.getByRole('button', { name: /mark as read/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /clear selection/i })).toBeDisabled();
  });
});
