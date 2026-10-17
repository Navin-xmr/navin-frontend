import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ETACountdown from './ETACountdown';

const NOW = new Date('2026-01-01T00:00:00.000Z');

describe('ETACountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the remaining time for an in-transit shipment', () => {
    render(<ETACountdown expectedDelivery="2026-01-02T02:03:04.000Z" status="IN_TRANSIT" />);

    expect(screen.getByText(/ETA countdown:/)).toHaveTextContent('ETA countdown: 1d 2h 3m 4s');
  });

  it('ticks down every second', () => {
    render(<ETACountdown expectedDelivery="2026-01-02T02:03:04.000Z" status="IN_TRANSIT" />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/ETA countdown:/)).toHaveTextContent('ETA countdown: 1d 2h 3m 3s');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/ETA countdown:/)).toHaveTextContent('ETA countdown: 1d 2h 3m 0s');
  });

  it('switches to the overdue state once the ETA has passed', () => {
    render(<ETACountdown expectedDelivery="2026-01-01T00:00:02.000Z" status="IN_TRANSIT" />);

    expect(screen.getByText(/ETA countdown:/)).toHaveTextContent('ETA countdown: 0d 0h 0m 2s');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText(/ETA countdown:/)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Delivery overdue by 1 hour');
  });

  it('pluralises the overdue hours', () => {
    render(<ETACountdown expectedDelivery="2025-12-31T21:30:00.000Z" status="IN_TRANSIT" />);

    expect(screen.getByRole('status')).toHaveTextContent('Delivery overdue by 3 hours');
  });

  it('renders the arrived state for a delivered shipment', () => {
    const expectedDelivery = '2025-12-30T12:00:00.000Z';
    const formatted = new Date(expectedDelivery).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

    render(<ETACountdown expectedDelivery={expectedDelivery} status="DELIVERED" />);

    expect(screen.getByText(`Delivered on ${formatted}`)).toBeInTheDocument();
    expect(screen.queryByText(/ETA countdown:/)).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renders the raw ETA for shipments that are not in transit', () => {
    render(<ETACountdown expectedDelivery="2026-01-05T00:00:00.000Z" status="CREATED" />);

    expect(screen.getByText('ETA: 2026-01-05T00:00:00.000Z')).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });
});
