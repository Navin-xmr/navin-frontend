import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CostPerRouteWidget from './CostPerRouteWidget';
import { ROUTE_COST_FIXTURE } from '@/test/fixtures/routeCostFixture';

describe('CostPerRouteWidget', () => {
  it('renders chart view by default', () => {
    render(<CostPerRouteWidget data={ROUTE_COST_FIXTURE} />);
    expect(screen.getByText('Cost per Route')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('Fuel')).toBeInTheDocument();
  });

  it('switches to table view and opens drill-down modal', () => {
    render(<CostPerRouteWidget data={ROUTE_COST_FIXTURE} />);

    fireEvent.click(screen.getByRole('button', { name: /Table/i }));
    expect(screen.getByRole('columnheader', { name: 'Margin' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('New York, NY → Los Angeles, CA'));
    expect(screen.getByText('Shipments on New York, NY → Los Angeles, CA')).toBeInTheDocument();
    expect(screen.getByText('NV-001')).toBeInTheDocument();
  });

  it('renders honest empty state when data is empty', () => {
    render(<CostPerRouteWidget data={[]} />);
    expect(screen.getByText('No route cost data available')).toBeInTheDocument();
  });

  it('renders the empty state, not invented routes, when no data is given', () => {
    render(<CostPerRouteWidget />);
    expect(screen.getByText('No route cost data available')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Table/i }));
    expect(screen.queryByRole('columnheader', { name: 'Margin' })).not.toBeInTheDocument();
  });

  it('shows a loading state', () => {
    render(<CostPerRouteWidget loading />);
    expect(screen.getByRole('status', { name: 'Loading cost per route chart…' })).toBeInTheDocument();
  });

  it('shows the error message and retries', () => {
    const onRetry = vi.fn();
    render(<CostPerRouteWidget error="Failed to load route cost data" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load route cost data');
    expect(screen.queryByText('No route cost data available')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
