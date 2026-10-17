import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PriorityBadge from './PriorityBadge';
import type { ShipmentPriority } from '../../../api/shipmentApi';

const LEVELS: { priority: ShipmentPriority; colorClass: string }[] = [
  { priority: 'URGENT', colorClass: 'text-red-400' },
  { priority: 'STANDARD', colorClass: 'text-blue-400' },
  { priority: 'ECONOMY', colorClass: 'text-slate-400' },
];

describe('PriorityBadge', () => {
  it('renders nothing when no priority is given', () => {
    const { container } = render(<PriorityBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(LEVELS)('renders the $priority badge with its styling', ({ priority, colorClass }) => {
    render(<PriorityBadge priority={priority} />);

    const badge = screen.getByText(priority);
    expect(badge).toHaveClass(colorClass);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens a listbox with every priority when editable', async () => {
    render(<PriorityBadge priority="STANDARD" editable />);

    const trigger = screen.getByRole('button', { name: 'STANDARD' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['URGENT', 'STANDARD', 'ECONOMY']);
    expect(screen.getByRole('option', { name: 'STANDARD' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'URGENT' })).toHaveAttribute('aria-selected', 'false');
  });

  it.each(LEVELS)('calls onChangePriority with $priority and closes the listbox', async ({ priority }) => {
    const onChangePriority = vi.fn();
    render(<PriorityBadge priority="STANDARD" editable onChangePriority={onChangePriority} />);

    await userEvent.click(screen.getByRole('button', { name: 'STANDARD' }));
    await userEvent.click(screen.getByRole('option', { name: priority }));

    expect(onChangePriority).toHaveBeenCalledWith(priority);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
