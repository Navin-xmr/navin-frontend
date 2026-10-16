import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Analytics from './Analytics';

const { mockUseAnalytics, mockNavigate } = vi.hoisted(() => ({
  mockUseAnalytics: vi.fn(),
  mockNavigate: vi.fn(),
}));
vi.mock('./hooks/useAnalytics', () => ({ useAnalytics: mockUseAnalytics }));
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
vi.mock('@components/common/Breadcrumb', () => ({ default: () => <nav>Breadcrumb</nav> }));
vi.mock('@components/ErrorFallback/ErrorFallback', () => ({ default: ({ error }: { error: Error }) => <div>{error.message}</div> }));
vi.mock('@components/ui/Skeleton', () => ({ DashboardWidgetSkeleton: () => <div>Loading</div>, Skeleton: () => <div>Loading</div> }));
vi.mock('../../components/dashboard/StatCard/StatCard', () => ({ default: ({ label, value }: { label: string; value: string }) => <div><span>{label}</span><span>{value}</span></div> }));
vi.mock('../../components/dashboard/Charts/ShipmentVolumeChart/ShipmentVolumeChart', () => ({ default: () => <div>Shipment volume chart</div> }));
vi.mock('../../components/dashboard/Charts/DeliverySuccessChart/DeliverySuccessChart', () => ({ default: () => <div>Delivery success chart</div> }));

const performance = {
  shipmentsByStatus: [{ status: 'DELIVERED', total: 12 }],
  averageDeliveryTimeByLogisticsId: [{ logisticsId: 'logistics-a' }],
  totalDelayedShipments: 2,
};
const summary = {
  totalShipmentsThisMonth: 12,
  totalShipmentsThisMonthPrev: 10,
  onTimeDeliveryRate: 90,
  onTimeDeliveryRatePrev: 85,
  averageTransitDays: 4,
  averageTransitDaysPrev: 5,
  disputeRate: 2,
  disputeRatePrev: 3,
  totalShipmentsSparkline: [4, 8, 12],
};

describe('Analytics', () => {
  it('renders the default analytics view with summary metrics and status data', async () => {
    mockUseAnalytics.mockReturnValue({ performance, summary, isLoading: false, error: null, refetch: vi.fn() });
    render(<Analytics />);
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByText('Total Shipments')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('DELIVERED')).toBeInTheDocument();
    expect(screen.getByText('Shipment volume chart')).toBeInTheDocument();
  });

  it('refetches analytics with the selected date range', async () => {
    mockUseAnalytics.mockReturnValue({ performance, summary, isLoading: false, error: null, refetch: vi.fn() });
    render(<Analytics />);
    const startDate = screen.getByLabelText('Start date');
    const endDate = screen.getByLabelText('End date');
    fireEvent.change(startDate, { target: { value: '2026-01-01' } });
    fireEvent.change(endDate, { target: { value: '2026-01-31' } });
    await waitFor(() => expect(mockUseAnalytics).toHaveBeenLastCalledWith({ startDate: '2026-01-01', endDate: '2026-01-31' }));
  });
});
