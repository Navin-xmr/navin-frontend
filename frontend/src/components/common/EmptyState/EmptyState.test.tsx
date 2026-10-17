import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="No shipments" description="Create one to get started" />);
    expect(screen.getByRole('heading', { name: 'No shipments' })).toBeInTheDocument();
    expect(screen.getByText('Create one to get started')).toBeInTheDocument();
  });

  it('renders the icon when provided', () => {
    render(<EmptyState title="No shipments" icon={<span data-testid="empty-icon" />} />);
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
  });

  it('does not render an action button without a cta', () => {
    render(<EmptyState title="No shipments" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders an action button and calls onClick when a cta is provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<EmptyState title="No shipments" cta={{ label: 'Create shipment', onClick }} />);
    await user.click(screen.getByRole('button', { name: 'Create shipment' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
