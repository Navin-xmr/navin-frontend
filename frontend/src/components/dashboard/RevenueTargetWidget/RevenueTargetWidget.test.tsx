import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RevenueTargetWidget from './RevenueTargetWidget';
import { REVENUE_TARGET_FIXTURE } from '@/test/fixtures/revenueTargetFixture';

describe('RevenueTargetWidget', () => {
  it('renders gauge center text, actual vs target, and projected EOM', () => {
    render(<RevenueTargetWidget data={REVENUE_TARGET_FIXTURE} />);

    expect(screen.getByText('Revenue vs Target')).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('Projected EOM')).toBeInTheDocument();
    expect(screen.getByText(/of target/)).toBeInTheDocument();
    expect(screen.getByLabelText('Daily revenue sparkline')).toBeInTheDocument();
  });

  it('shows a "no target set" empty state, not a gauge, when no data is given', () => {
    render(<RevenueTargetWidget />);

    expect(screen.getByText('Revenue vs Target')).toBeInTheDocument();
    expect(screen.getByText('No revenue target set')).toBeInTheDocument();
    expect(screen.queryByText(/of target/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Daily revenue sparkline')).not.toBeInTheDocument();
  });

  it('shows the empty state when the target is zero', () => {
    render(<RevenueTargetWidget data={{ actual: 1200, target: 0, dailyRevenue: [] }} />);

    expect(screen.getByText('No revenue target set')).toBeInTheDocument();
    expect(screen.queryByText(/of target/)).not.toBeInTheDocument();
  });

  it('shows a loading state', () => {
    render(<RevenueTargetWidget loading />);
    expect(screen.getByRole('status', { name: 'Loading revenue target…' })).toBeInTheDocument();
  });

  it('shows the error message and retries', () => {
    const onRetry = vi.fn();
    render(<RevenueTargetWidget error="Could not load revenue target" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load revenue target');
    expect(screen.queryByText('No revenue target set')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
