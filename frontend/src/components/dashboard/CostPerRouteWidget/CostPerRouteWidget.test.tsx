import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CostPerRouteWidget from './CostPerRouteWidget';
import { MOCK_ROUTE_COST_DATA } from './mockCostPerRouteData';

describe('CostPerRouteWidget', () => {
  it('renders chart view by default', () => {
    render(<CostPerRouteWidget data={MOCK_ROUTE_COST_DATA} />);
    expect(screen.getByText('Cost per Route')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('Fuel')).toBeInTheDocument();
  });

  it('switches to table view and opens drill-down modal', () => {
    render(<CostPerRouteWidget data={MOCK_ROUTE_COST_DATA} />);

    fireEvent.click(screen.getByRole('button', { name: /Table/i }));
    expect(screen.getByRole('columnheader', { name: 'Margin' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('New York, NY → Los Angeles, CA'));
    expect(screen.getByText('Shipments on New York, NY → Los Angeles, CA')).toBeInTheDocument();
    expect(screen.getByText('NV-001')).toBeInTheDocument();
  });
});
