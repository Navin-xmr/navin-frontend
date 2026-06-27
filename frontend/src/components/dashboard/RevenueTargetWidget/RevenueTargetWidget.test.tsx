import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RevenueTargetWidget from './RevenueTargetWidget';
import { MOCK_REVENUE_TARGET_DATA } from './mockRevenueTargetData';

describe('RevenueTargetWidget', () => {
  it('renders gauge center text, actual vs target, and projected EOM', () => {
    render(<RevenueTargetWidget data={MOCK_REVENUE_TARGET_DATA} />);

    expect(screen.getByText('Revenue vs Target')).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('Projected EOM')).toBeInTheDocument();
    expect(screen.getByText(/of target/)).toBeInTheDocument();
    expect(screen.getByLabelText('Daily revenue sparkline')).toBeInTheDocument();
  });
});
