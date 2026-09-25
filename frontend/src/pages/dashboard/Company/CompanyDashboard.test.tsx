import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CompanyDashboard from './CompanyDashboard';

vi.mock('./QuickActions', () => ({
  QuickActionsCard: () => <div data-testid="quick-actions" />,
}));

vi.mock('./RecentShipments/RecentShipments', () => ({
  default: () => <div data-testid="recent-shipments" />,
}));

vi.mock('./RecentActivity/RecentActivityFeed', () => ({
  default: () => <div data-testid="recent-activity" />,
}));

vi.mock('./ShipmentsMap/ShipmentsMapWidget', () => ({
  default: () => <div data-testid="shipments-map" />,
}));

vi.mock('./RevenueSummary/RevenueSummaryWidget', () => ({
  default: () => <div data-testid="revenue-summary" />,
}));

vi.mock('../../../components/dashboard/CostPerRouteWidget', () => ({
  CostPerRouteWidget: () => <div data-testid="cost-per-route" />,
}));

vi.mock('../../../components/dashboard/RevenueTargetWidget', () => ({
  RevenueTargetWidget: () => <div data-testid="revenue-target" />,
}));

vi.mock('./Scorecard/PerformanceScorecardWidget', () => ({
  default: () => <div data-testid="performance-scorecard" />,
}));

vi.mock('@services/api/endpoints/shipments', () => ({
  shipmentApi: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('@services/api/endpoints/analytics', () => ({
  analyticsApi: {
    getSummary: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@services/api/endpoints/settlements', () => ({
  settlementsApi: {
    getSummary: vi.fn().mockResolvedValue({}),
  },
}));

describe('CompanyDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a refresh control for the dashboard overview', async () => {
    render(
      <MemoryRouter>
        <CompanyDashboard />
      </MemoryRouter>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh dashboard/i });
    expect(refreshButton).toBeInTheDocument();

    fireEvent.click(refreshButton);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText(/last refreshed/i)).toBeInTheDocument();
  });
});
