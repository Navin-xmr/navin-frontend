import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import BulkActionBar from './BulkActionBar';

describe('BulkActionBar', () => {
  const renderBar = (count = 3) => {
    const props = {
      count,
      onUpdateStatus: vi.fn(),
      onExport: vi.fn(),
      onClear: vi.fn(),
    };
    render(<BulkActionBar {...props} />);
    return props;
  };

  it('renders nothing when count is 0', () => {
    renderBar(0);
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('displays the selected count', () => {
    renderBar(5);
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument();
    expect(screen.getByText('5 selected')).toBeInTheDocument();
  });

  it('calls onUpdateStatus when Update Status is clicked', async () => {
    const user = userEvent.setup();
    const { onUpdateStatus } = renderBar();
    await user.click(screen.getByRole('button', { name: 'Update Status' }));
    expect(onUpdateStatus).toHaveBeenCalledTimes(1);
  });

  it('calls onExport with the chosen format', async () => {
    const user = userEvent.setup();
    const { onExport } = renderBar();
    await user.click(screen.getByRole('button', { name: 'Export Selected options' }));
    await user.click(screen.getByRole('option', { name: /CSV/ }));
    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('calls onClear when Clear selection is clicked', async () => {
    const user = userEvent.setup();
    const { onClear } = renderBar();
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
