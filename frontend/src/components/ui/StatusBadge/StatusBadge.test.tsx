import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the display label for a known status', () => {
    render(<StatusBadge status="CREATED" />);
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });

  it('renders all known statuses with correct labels', () => {
    const statuses = [
      { status: 'CREATED', label: 'Pending Approval' },
      { status: 'IN_TRANSIT', label: 'In Transit' },
      { status: 'DELIVERED', label: 'Delivered' },
      { status: 'CANCELLED', label: 'Cancelled' },
    ];

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('falls back to raw status string for unknown statuses', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });

  it('has an accessible aria-label', () => {
    render(<StatusBadge status="DELIVERED" />);
    expect(screen.getByLabelText('Shipment status: Delivered')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<StatusBadge status="CREATED" className="my-custom-class" />);
    const badge = screen.getByText('Pending Approval');
    expect(badge).toHaveClass('my-custom-class');
  });

  it('renders as a span element', () => {
    render(<StatusBadge status="DELIVERED" />);
    const badge = screen.getByText('Delivered');
    expect(badge.tagName).toBe('SPAN');
  });

  it('applies status-specific badge classes', () => {
    render(<StatusBadge status="DELIVERED" />);
    const badge = screen.getByText('Delivered');
    expect(badge.className).toContain('text-[#10b981]');
  });
});
