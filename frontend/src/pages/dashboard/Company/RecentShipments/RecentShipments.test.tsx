import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RecentShipments from './RecentShipments';

const getFirstDataRow = () => {
  const rows = screen.getAllByRole('row');
  return rows[1];
};

describe('RecentShipments', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a loading skeleton before data is loaded', () => {
    render(<RecentShipments />);

    expect(screen.getByLabelText('Recent shipments loading')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('Shipment ID')).toBeInTheDocument();
  });

  it('shows an empty state when there are no shipments', () => {
    render(<RecentShipments shipments={[]} loadingDelayMs={0} />);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText('No shipments found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your first shipment/i })).toBeInTheDocument();
  });

  it('sorts by created date when header is clicked', () => {
    render(<RecentShipments loadingDelayMs={0} />);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(within(getFirstDataRow()).getByText('SHP-1001')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sort by created date/i }));

    expect(within(getFirstDataRow()).getByText('SHP-1015')).toBeInTheDocument();
  });

  it('sorts by status and toggles direction', () => {
    render(<RecentShipments loadingDelayMs={0} />);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /sort by status/i }));
    expect(within(getFirstDataRow()).getByText('Pending Approval')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sort by status/i }));
    expect(within(getFirstDataRow()).getByText('Cancelled')).toBeInTheDocument();
  });

  it('paginates with next and page number controls', () => {
    render(<RecentShipments loadingDelayMs={0} />);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('SHP-1006')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('SHP-1011')).toBeInTheDocument();
  });
});

