import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PaymentSummaryCards, { type PaymentSummaryData } from './PaymentSummaryCards';

const cards: PaymentSummaryData[] = [
  { icon: <span />, value: '1,250', label: 'Released this month' },
  { icon: <span />, value: '300', label: 'In escrow this month' },
  { icon: <span />, value: '75.5', label: 'Pending this month' },
];

describe('PaymentSummaryCards', () => {
  it('renders each provided card with its label and value', () => {
    render(<PaymentSummaryCards cards={cards} />);
    expect(screen.getByText('Released this month')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('In escrow this month')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('Pending this month')).toBeInTheDocument();
    expect(screen.getByText('75.5')).toBeInTheDocument();
  });

  it('shows the empty state when there are no cards', () => {
    render(<PaymentSummaryCards cards={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('No payment data available');
  });

  it('shows the empty state, not invented figures, when no cards are given', () => {
    render(<PaymentSummaryCards />);
    expect(screen.getByRole('status')).toHaveTextContent('No payment data available');
    expect(screen.queryByText('$127,450')).not.toBeInTheDocument();
    expect(screen.queryByText('156')).not.toBeInTheDocument();
  });

  it('shows a busy placeholder while loading, even when cards are present', () => {
    render(<PaymentSummaryCards cards={cards} isLoading />);
    expect(screen.getByRole('status', { name: 'Loading payment summary' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.queryByText('Released this month')).not.toBeInTheDocument();
  });

  it('shows the error with a retry that calls onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<PaymentSummaryCards error="summary unavailable" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('summary unavailable');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the error without a retry button when onRetry is not given', () => {
    render(<PaymentSummaryCards error="summary unavailable" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });
});
