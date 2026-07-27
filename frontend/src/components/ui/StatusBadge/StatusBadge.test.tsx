import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  // --- Rendering ---
  it('renders the display label for a known status', () => {
    render(<StatusBadge status="CREATED" />);
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<StatusBadge status="DELIVERED" />);
    expect(screen.getByText('Delivered').tagName).toBe('SPAN');
  });

  it('falls back to raw status string for unknown statuses', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });

  // --- All variants ---
  it.each([
    { status: 'CREATED',    label: 'Pending Approval', colorToken: '#f59e0b' },
    { status: 'IN_TRANSIT', label: 'In Transit',        colorToken: '#3b82f6' },
    { status: 'DELIVERED',  label: 'Delivered',         colorToken: '#10b981' },
    { status: 'CANCELLED',  label: 'Cancelled',         colorToken: '#ef4444' },
  ])('renders $status with correct label and color class', ({ status, label, colorToken }) => {
    const { unmount } = render(<StatusBadge status={status} />);
    const badge = screen.getByText(label);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain(colorToken);
    unmount();
  });

  // --- Accessibility ---
  it.each([
    { status: 'CREATED',    ariaLabel: 'Shipment status: Pending Approval' },
    { status: 'IN_TRANSIT', ariaLabel: 'Shipment status: In Transit'        },
    { status: 'DELIVERED',  ariaLabel: 'Shipment status: Delivered'         },
    { status: 'CANCELLED',  ariaLabel: 'Shipment status: Cancelled'         },
  ])('has correct aria-label for $status', ({ status, ariaLabel }) => {
    const { unmount } = render(<StatusBadge status={status} />);
    expect(screen.getByLabelText(ariaLabel)).toBeInTheDocument();
    unmount();
  });

  it('aria-label reflects raw value for unknown status', () => {
    render(<StatusBadge status="PENDING_REVIEW" />);
    expect(screen.getByLabelText('Shipment status: PENDING_REVIEW')).toBeInTheDocument();
  });

  // --- className prop ---
  it('applies a custom className alongside base classes', () => {
    render(<StatusBadge status="CREATED" className="my-custom-class" />);
    const badge = screen.getByText('Pending Approval');
    expect(badge).toHaveClass('my-custom-class');
    expect(badge).toHaveClass('rounded-full');
  });

  it('works without a custom className', () => {
    render(<StatusBadge status="DELIVERED" />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  // --- Unknown status fallback styling ---
  it('applies fallback classes for an unknown status', () => {
    render(<StatusBadge status="UNKNOWN" />);
    const badge = screen.getByText('UNKNOWN');
    expect(badge.className).toContain('bg-text-secondary');
  });
});
