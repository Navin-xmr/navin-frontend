import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CostBreakdown, { type CostBreakdownData } from './CostBreakdown';

const usd = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const data: CostBreakdownData = {
  baseRate: 100,
  weightSurcharge: 20,
  fuelSurcharge: 15,
  insuranceFee: 10,
  customsDuty: 5,
  discount: 8,
  total: 142,
  currency: 'USD',
};

describe('CostBreakdown', () => {
  it('shows a loading skeleton while calculating', () => {
    render(<CostBreakdown isLoading />);

    expect(screen.getByText('Calculating…')).toBeInTheDocument();
    expect(screen.queryByText('Settlement total')).not.toBeInTheDocument();
  });

  it('shows an empty state when there is no data yet', () => {
    render(<CostBreakdown data={null} />);

    expect(
      screen.getByText('Fill in origin, destination, and weight to see an estimate.'),
    ).toBeInTheDocument();
  });

  it('renders every line item, the subtotal, and the total for populated data', () => {
    render(<CostBreakdown data={data} mode="estimate" />);

    expect(screen.getByText('Base Rate')).toBeInTheDocument();
    expect(screen.getByText(usd(100))).toBeInTheDocument();
    expect(screen.getByText('Weight Surcharge')).toBeInTheDocument();
    expect(screen.getByText('Customs Duty')).toBeInTheDocument();
    expect(screen.getByText('Discount')).toBeInTheDocument();
    expect(screen.getAllByText(usd(-8)).length).toBeGreaterThan(0);
    expect(screen.getByText('Subtotal before discounts')).toBeInTheDocument();
    expect(screen.getByText(usd(150))).toBeInTheDocument();
    expect(screen.getByText('Settlement total')).toBeInTheDocument();
    expect(screen.getByText(usd(142))).toBeInTheDocument();
    expect(screen.getByText('* Estimate only. Final charges may vary.')).toBeInTheDocument();
  });

  it('hides zero-value lines and the estimate disclaimer in confirmed mode', () => {
    const confirmedData: CostBreakdownData = { ...data, customsDuty: 0, discount: 0 };
    render(<CostBreakdown data={confirmedData} mode="confirmed" />);

    expect(screen.queryByText('Customs Duty')).not.toBeInTheDocument();
    expect(screen.queryByText('Discount')).not.toBeInTheDocument();
    expect(screen.queryByText('* Estimate only. Final charges may vary.')).not.toBeInTheDocument();
  });
});
