import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Title" description="Some description" />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<EmptyState title="Title" />);
    expect(screen.queryByText('Some description')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="Title" icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('does not render CTA button when action is not provided', () => {
    render(<EmptyState title="Title" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders CTA button when action is provided', async () => {
    const onClick = vi.fn();
    render(<EmptyState title="Title" action={{ label: 'Click me', onClick }} />);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  describe('NoShipments variant', () => {
    it('renders with default content', () => {
      render(<EmptyState.NoShipments />);
      expect(screen.getByText('No shipments found')).toBeInTheDocument();
    });

    it('allows overriding props', () => {
      render(<EmptyState.NoShipments title="Custom title" />);
      expect(screen.getByText('Custom title')).toBeInTheDocument();
    });
  });

  describe('NoResults variant', () => {
    it('renders with default content', () => {
      render(<EmptyState.NoResults />);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  describe('NoNotifications variant', () => {
    it('renders with default content', () => {
      render(<EmptyState.NoNotifications />);
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });
});
