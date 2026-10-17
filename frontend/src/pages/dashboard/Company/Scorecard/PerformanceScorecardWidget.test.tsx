import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnalyticsSummary } from '@services/api/endpoints/analytics';
import PerformanceScorecardWidget from './PerformanceScorecardWidget';

const { mockGetSummary } = vi.hoisted(() => ({
  mockGetSummary: vi.fn<() => Promise<AnalyticsSummary | null>>(),
}));

vi.mock('@services/api/endpoints/analytics', () => ({
  analyticsApi: { getSummary: mockGetSummary },
}));

const summary: AnalyticsSummary = {
  onTimeDeliveryRate: 96.7,
  onTimeDeliveryRatePrev: 95.2,
  onTimeDeliverySparkline: [92, 94, 96.7],
  averageTransitDays: 4.2,
  averageTransitDaysPrev: 3.8,
  averageTransitDaysSparkline: [3.8, 4, 4.2],
  totalShipmentsThisMonth: 1234,
  totalShipmentsThisMonthPrev: 1100,
  totalShipmentsSparkline: [1000, 1100, 1234],
  disputeRate: 2.4,
  disputeRatePrev: 1.8,
  disputeRateSparkline: [1.8, 2, 2.4],
};

const emptySummary: AnalyticsSummary = {
  onTimeDeliveryRate: 0,
  onTimeDeliveryRatePrev: 0,
  onTimeDeliverySparkline: [],
  averageTransitDays: 0,
  averageTransitDaysPrev: 0,
  averageTransitDaysSparkline: [],
  totalShipmentsThisMonth: 0,
  totalShipmentsThisMonthPrev: 0,
  totalShipmentsSparkline: [],
  disputeRate: 0,
  disputeRatePrev: 0,
  disputeRateSparkline: [],
};

function CurrentLocation() {
  const { pathname } = useLocation();
  return <output data-testid="current-location">{pathname}</output>;
}

function renderWidget() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <PerformanceScorecardWidget />
      <CurrentLocation />
    </MemoryRouter>,
  );
}

function tile(label: string) {
  return within(screen.getByText(label).parentElement as HTMLElement);
}

describe('PerformanceScorecardWidget', () => {
  beforeEach(() => {
    mockGetSummary.mockReset();
    mockGetSummary.mockResolvedValue(summary);
  });

  it('shows four skeletons while the summary is loading', () => {
    mockGetSummary.mockReturnValue(new Promise<AnalyticsSummary>(() => {}));
    const { container } = renderWidget();

    expect(screen.getByText('Performance Scorecard')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'KPIs vs. previous period' })).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
    expect(screen.queryByText('On-Time Delivery')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /View Full Analytics/ })).not.toBeInTheDocument();
    expect(mockGetSummary).toHaveBeenCalledTimes(1);
  });

  it('keeps the header but does not render KPIs when no summary is returned', async () => {
    mockGetSummary.mockResolvedValue(null);
    const { container } = renderWidget();

    await waitFor(() => expect(container.querySelectorAll('.animate-pulse')).toHaveLength(0));

    expect(screen.getByText('Performance Scorecard')).toBeInTheDocument();
    expect(screen.queryByText('On-Time Delivery')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /View Full Analytics/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Unable to load scorecard data.')).not.toBeInTheDocument();
  });

  it('renders zero values and empty sparklines when there is no activity', async () => {
    mockGetSummary.mockResolvedValue(emptySummary);
    const { container } = renderWidget();
    await screen.findByText('On-Time Delivery');

    expect(tile('On-Time Delivery').getByText('0.0%')).toBeInTheDocument();
    expect(tile('Avg Transit Days').getByText('0.0')).toBeInTheDocument();
    expect(tile('Shipments This Month').getByText('0')).toBeInTheDocument();
    expect(tile('Dispute Rate').getByText('0.0%')).toBeInTheDocument();
    const paths = container.querySelectorAll('svg[viewBox="0 0 100 50"] path');
    expect(paths).toHaveLength(4);
    for (const path of paths) expect(path).toHaveAttribute('d', '');
    expect(screen.getByRole('link', { name: /View Full Analytics/ })).toBeInTheDocument();
  });

  it('renders formatted KPIs, sparklines, and the correct comparison trends', async () => {
    const { container } = renderWidget();
    await screen.findByText('On-Time Delivery');

    expect(tile('On-Time Delivery').getByText('96.7%')).toBeInTheDocument();
    expect(tile('On-Time Delivery').getByLabelText('Improving')).toBeInTheDocument();
    expect(tile('Avg Transit Days').getByText('4.2')).toBeInTheDocument();
    expect(tile('Avg Transit Days').getByLabelText('Worsening')).toBeInTheDocument();
    expect(tile('Shipments This Month').getByText('1,234')).toBeInTheDocument();
    expect(tile('Shipments This Month').getByLabelText('Improving')).toBeInTheDocument();
    expect(tile('Dispute Rate').getByText('2.4%')).toBeInTheDocument();
    expect(tile('Dispute Rate').getByLabelText('Worsening')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(0);
    const paths = container.querySelectorAll('svg[viewBox="0 0 100 50"] path');
    expect(paths).toHaveLength(4);
    for (const path of paths) expect(path.getAttribute('d')).toMatch(/^M .+ L /);
  });

  it('links to the full analytics page', async () => {
    const user = userEvent.setup();
    renderWidget();
    const link = await screen.findByRole('link', { name: /View Full Analytics/ });

    expect(link).toHaveAttribute('href', '/dashboard/analytics');
    await user.click(link);

    expect(screen.getByTestId('current-location')).toHaveTextContent('/dashboard/analytics');
  });

  it('shows an error instead of KPIs if the summary request fails', async () => {
    mockGetSummary.mockRejectedValue(new Error('Network error'));
    const { container } = renderWidget();

    expect(await screen.findByText('Unable to load scorecard data.')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(0);
    expect(screen.queryByText('On-Time Delivery')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /View Full Analytics/ })).not.toBeInTheDocument();
  });
});
