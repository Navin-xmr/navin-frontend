import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PaymentSummaryCards from './PaymentSummaryCards';

describe('PaymentSummaryCards', () => {
  it('renders each payment total with the expected labels and formatted value', () => {
    render(<PaymentSummaryCards />);
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText('$127,450')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('134')).toBeInTheDocument();
    expect(screen.getByText('Total Payments')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Pending Payments')).toBeInTheDocument();
    expect(screen.getByText('Released Payments')).toBeInTheDocument();
  });

  it('renders the fixed empty-state shape without crashing when the summary is empty', () => {
    render(<PaymentSummaryCards cards={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('No payment data available');
  });
});
