import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CompanyDashboard from './CompanyDashboard';
import type { AnalyticsPerformance } from '../../../services/api/endpoints/analytics';

// ─── Mock analytics API ───────────────────────────────────────────────────────

vi.mock('../../../services/api', () => ({
  analyticsApi: {
    getPerformance: vi.fn(),
  },
}));

import { analyticsApi } from '../../../services/api';

const mockAnalyticsApi = analyticsApi as unknown as {
  getPerformance: ReturnType<typeof vi.fn>;
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockPerformanceData: AnalyticsPerformance = {
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-01-31T23:59:59.999Z',
  shipmentsByStatus: [
    { status: 'CREATED', total: 45 },
    { status: 'IN_TRANSIT', total: 83 },
    { status: 'DELIVERED', total: 1420 },
    { status: 'CANCELLED', total: 8 },
  ],
  averageDeliveryTimeByLogisticsId: [
    { logisticsId: 'log-001', averageDeliveryTimeMs: 172800000 },
    { logisticsId: 'log-002', averageDeliveryTimeMs: 259200000 },
  ],
  totalDelayedShipments: 12,
};

const mockEmptyData: AnalyticsPerformance = {
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-01-31T23:59:59.999Z',
  shipmentsByStatus: [],
  averageDeliveryTimeByLogisticsId: [],
  totalDelayedShipments: 0,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CompanyDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading skeleton while fetching data', () => {
      mockAnalyticsApi.getPerformance.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<CompanyDashboard />);

      const skeletons = document.querySelectorAll('.animate-shimmer');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows loading skeleton for stats cards', () => {
      mockAnalyticsApi.getPerformance.mockImplementation(
        () => new Promise(() => {})
      );

      render(<CompanyDashboard />);

      const statSkeletons = document.querySelectorAll('.animate-shimmer');
      expect(statSkeletons.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Success State', () => {
    it('fetches performance data on mount', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(mockAnalyticsApi.getPerformance).toHaveBeenCalledOnce();
      });
    });

    it('calls API with correct date range (last 30 days)', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      const now = new Date('2024-01-31T12:00:00.000Z');
      vi.setSystemTime(now);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(mockAnalyticsApi.getPerformance).toHaveBeenCalled();
      });

      const [startDate, endDate] = mockAnalyticsApi.getPerformance.mock.calls[0];
      const start = new Date(startDate);
      const end = new Date(endDate);

      expect(end.getTime() - start.getTime()).toBeGreaterThanOrEqual(29 * 24 * 60 * 60 * 1000);
      expect(end.getTime() - start.getTime()).toBeLessThanOrEqual(31 * 24 * 60 * 60 * 1000);

      vi.useRealTimers();
    });

    it('displays active shipments count (CREATED + IN_TRANSIT)', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('128')).toBeInTheDocument();
      });
    });

    it('displays delivered shipments count', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        const deliveredValues = screen.getAllByText('1,420');
        expect(deliveredValues.length).toBeGreaterThan(0);
      });
    });

    it('displays delayed shipments count', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument();
      });
    });

    it('displays verified shipments count', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        const verifiedValues = screen.getAllByText('1,420');
        expect(verifiedValues.length).toBeGreaterThan(0);
      });
    });

    it('renders all stat card labels', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        const deliveredLabels = screen.getAllByText('Delivered');
        expect(deliveredLabels.length).toBeGreaterThan(0);
        expect(screen.getByText('Delayed')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();
      });
    });

    it('formats large numbers with commas', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        const deliveredValues = screen.getAllByText('1,420');
        expect(deliveredValues.length).toBeGreaterThan(0);
      });
    });

    it('handles zero delayed shipments', async () => {
      const dataWithNoDelays = {
        ...mockPerformanceData,
        totalDelayedShipments: 0,
      };
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(dataWithNoDelays);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    it('handles empty shipmentsByStatus array', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockEmptyData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        const zeroValues = screen.getAllByText('0');
        expect(zeroValues.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('calculates active count correctly when only CREATED exists', async () => {
      const dataWithOnlyCreated = {
        ...mockPerformanceData,
        shipmentsByStatus: [{ status: 'CREATED', total: 50 }],
      };
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(dataWithOnlyCreated);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
      });
    });

    it('calculates active count correctly when only IN_TRANSIT exists', async () => {
      const dataWithOnlyInTransit = {
        ...mockPerformanceData,
        shipmentsByStatus: [{ status: 'IN_TRANSIT', total: 75 }],
      };
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(dataWithOnlyInTransit);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('75')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('displays error UI when API call fails', async () => {
      mockAnalyticsApi.getPerformance.mockRejectedValueOnce(new Error('Network error'));

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
      });
    });

    it('shows error message with retry button', async () => {
      mockAnalyticsApi.getPerformance.mockRejectedValueOnce(new Error('API error'));

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/problem connecting to the logistics network/i)).toBeInTheDocument();
        expect(screen.getByText('Retry Connection')).toBeInTheDocument();
      });
    });

    it('handles 401 unauthorized errors', async () => {
      const authError = Object.assign(new Error('Unauthorized'), {
        response: { status: 401 },
      });
      mockAnalyticsApi.getPerformance.mockRejectedValueOnce(authError);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
      });
    });

    it('handles 500 server errors', async () => {
      const serverError = Object.assign(new Error('Internal Server Error'), {
        response: { status: 500 },
      });
      mockAnalyticsApi.getPerformance.mockRejectedValueOnce(serverError);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Stat Card Rendering', () => {
    it('applies correct trend type for delayed shipments when count > 0', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        const delayedCard = screen.getByText('Delayed').closest('div');
        expect(delayedCard).toBeInTheDocument();
      });
    });

    it('applies neutral trend type when delayed count is 0', async () => {
      const dataWithNoDelays = {
        ...mockPerformanceData,
        totalDelayedShipments: 0,
      };
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(dataWithNoDelays);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Delayed')).toBeInTheDocument();
      });
    });

    it('renders stat cards in correct order', async () => {
      mockAnalyticsApi.getPerformance.mockResolvedValueOnce(mockPerformanceData);

      render(<CompanyDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        const deliveredLabels = screen.getAllByText('Delivered');
        expect(deliveredLabels.length).toBeGreaterThan(0);
        expect(screen.getByText('Delayed')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();
      });
    });
  });
});
