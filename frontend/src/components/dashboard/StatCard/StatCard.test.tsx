import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Total Shipments" value={1234} />);
    expect(screen.getByText('Total Shipments')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders a string value as-is', () => {
    render(<StatCard label="Status" value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('formats numeric values with thousands separators', () => {
    render(<StatCard label="Revenue" value={1234567} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders a prefix and suffix around the value', () => {
    render(<StatCard label="Revenue" value={500} prefix="$" suffix=" USD" />);
    expect(screen.getByText(/\$500 USD/)).toBeInTheDocument();
  });

  it('renders an up trend indicator', () => {
    render(<StatCard label="Growth" value={10} trend="up" trendValue="+5%" />);
    expect(screen.getByText('+5%')).toBeInTheDocument();
    expect(screen.getByLabelText(/trend up/i)).toBeInTheDocument();
  });

  it('renders a down trend indicator', () => {
    render(<StatCard label="Churn" value={3} trend="down" trendValue="-2%" />);
    expect(screen.getByText('-2%')).toBeInTheDocument();
    expect(screen.getByLabelText(/trend down/i)).toBeInTheDocument();
  });

  it('renders a neutral trend indicator', () => {
    render(<StatCard label="Churn" value={3} trend="neutral" trendValue="0%" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByLabelText(/trend neutral/i)).toBeInTheDocument();
  });

  it('does not render a trend indicator when trend is omitted', () => {
    render(<StatCard label="Total" value={1} />);
    expect(screen.queryByLabelText(/trend/i)).not.toBeInTheDocument();
  });

  it('renders the loading state', () => {
    render(<StatCard label="Total" loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
  });
});
