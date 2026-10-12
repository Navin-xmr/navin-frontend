import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ShipmentDetail from './ShipmentDetail';
import { shipmentApi } from '@services/api/endpoints/shipments';
import type { Shipment } from '@services/api/endpoints/shipments';

const mockRefresh = vi.fn();
const mockAddToast = vi.fn();
const mockAnnounce = vi.fn();

const mockShipment: Shipment = {
  _id: 'ship-001',
  id: 'ship-001',
  trackingNumber: 'NAV-2024-001',
  origin: 'New York, NY',
  destination: 'Boston, MA',
  enterpriseId: 'ent-1',
  logisticsId: 'log-1',
  status: 'IN_TRANSIT',
  milestones: [],
  createdAt: '2024-03-15T10:30:00.000Z',
  updatedAt: '2024-03-15T10:30:00.000Z',
};

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useParams: () => ({ id: 'ship-001' }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string | Record<string, unknown>) =>
      typeof fallback === 'string' ? fallback : _key,
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({ role: 'company' }),
}));

vi.mock('../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => true,
}));

vi.mock('../../context/LiveRegionContext', () => ({
  useLiveRegion: () => ({ announce: mockAnnounce }),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock('../../hooks/useRealtimeEvents', () => ({
  useRealtimeEvents: () => ({}),
}));

const detailState = {
  lastUpdatedAt: null as number | null,
  isStale: false,
  isLoading: false,
};

vi.mock('../../hooks/useShipmentDetail', () => ({
  useShipmentDetail: () => ({
    shipment: mockShipment,
    isLoading: detailState.isLoading,
    error: null,
    refresh: mockRefresh,
    lastUpdatedAt: detailState.lastUpdatedAt,
    isStale: detailState.isStale,
  }),
}));

vi.mock('@services/api/endpoints/shipments', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@services/api/endpoints/shipments')>();
  return {
    ...actual,
    shipmentApi: {
      ...actual.shipmentApi,
      updateStatus: vi.fn(),
    },
  };
});

// Mock heavy visual components to keep tests fast and focused
vi.mock('./ShipmentMap/ShipmentMap', () => ({ default: () => <div data-testid="shipment-map" /> }));
vi.mock('./SensorDataCards/SensorDataCards', () => ({ default: () => <div data-testid="sensor-cards" /> }));
vi.mock('./PaymentStatus/PaymentStatus', () => ({ default: () => <div data-testid="payment-status" /> }));
vi.mock('./EscrowStatus/EscrowStatus', () => ({
  default: ({ refreshKey }: { refreshKey?: number | null }) => (
    <div data-testid="escrow-status" data-refresh-key={refreshKey ?? ''} />
  ),
}));
vi.mock('./DeliveryProofUpload/DeliveryProofUpload', () => ({ default: () => <div data-testid="proof-upload" /> }));
vi.mock('./PhotosSection/PhotosSection', () => ({ default: () => <div data-testid="photos-section" /> }));
vi.mock('./DocumentsSection/DocumentsSection', () => ({ default: () => <div data-testid="documents-section" /> }));
vi.mock('./NotesSection/NotesSection', () => ({ default: () => <div data-testid="notes-section" /> }));
vi.mock('../../components/shipment/MilestoneTimeline/MilestoneTimeline', () => ({ default: () => <div data-testid="milestones" /> }));
vi.mock('../../components/shipment/DeliveryConfirmation', () => ({ default: () => <div data-testid="delivery-confirmation" /> }));
vi.mock('../../components/shipment/ShipmentComparison', () => ({ default: () => null }));
vi.mock('./ShipmentStickyBar', () => ({ default: () => null }));
vi.mock('./ShareQRCodeModal/ShareQRCodeModal', () => ({ default: () => null }));

const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

describe('ShipmentDetail Status Update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    detailState.lastUpdatedAt = null;
    detailState.isStale = false;
    detailState.isLoading = false;
  });

  it('opens status modal and updates status via shipmentApi.updateStatus', async () => {
    const user = userEvent.setup();
    const mockUpdateStatus = vi.mocked(shipmentApi.updateStatus);
    mockUpdateStatus.mockResolvedValueOnce({
      ...mockShipment,
      status: 'DELIVERED',
    });

    render(<ShipmentDetail />);

    // Click "Update Status" button in header
    const updateStatusBtn = screen.getByRole('button', { name: /update status/i });
    await user.click(updateStatusBtn);

    // Modal should be open
    expect(screen.getByRole('dialog', { name: /update shipment status/i })).toBeInTheDocument();

    // Click "Mark as DELIVERED"
    const markDeliveredBtn = screen.getByRole('button', { name: /mark as delivered/i });
    await user.click(markDeliveredBtn);

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith('ship-001', 'DELIVERED');
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockAddToast).toHaveBeenCalledWith(expect.any(String), 'success');
    });
  });

  it('shows error toast when status update fails', async () => {
    const user = userEvent.setup();
    const mockUpdateStatus = vi.mocked(shipmentApi.updateStatus);
    mockUpdateStatus.mockRejectedValueOnce(new Error('Network error'));

    render(<ShipmentDetail />);

    const updateStatusBtn = screen.getByRole('button', { name: /update status/i });
    await user.click(updateStatusBtn);

    const markDeliveredBtn = screen.getByRole('button', { name: /mark as delivered/i });
    await user.click(markDeliveredBtn);

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith('ship-001', 'DELIVERED');
      expect(mockAddToast).toHaveBeenCalledWith('Network error', 'error');
    });
  });

  describe('stale contract state', () => {
    it('shows when the data was last fetched and passes it to the escrow panel', () => {
      detailState.lastUpdatedAt = new Date('2026-09-30T10:15:30.000Z').getTime();

      render(<ShipmentDetail />);

      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
      expect(screen.getByTestId('last-updated')).toHaveAttribute('datetime', '2026-09-30T10:15:30.000Z');
      expect(screen.getByTestId('last-updated')).not.toHaveTextContent('—');
      // Escrow/settlement state is re-read whenever the detail data is refreshed.
      expect(screen.getByTestId('escrow-status')).toHaveAttribute(
        'data-refresh-key',
        String(detailState.lastUpdatedAt),
      );
    });

    it('offers a Refresh now button that refetches immediately', async () => {
      const user = userEvent.setup();
      detailState.lastUpdatedAt = Date.now();

      render(<ShipmentDetail />);
      await user.click(screen.getByRole('button', { name: /refresh now/i }));

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('does not show the stale banner for fresh data', () => {
      detailState.lastUpdatedAt = Date.now();

      render(<ShipmentDetail />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the stale banner when the data is older than 5 minutes', () => {
      detailState.lastUpdatedAt = Date.now() - 6 * 60_000;
      detailState.isStale = true;

      render(<ShipmentDetail />);

      expect(screen.getByRole('alert')).toHaveTextContent('This data is stale, click Refresh');
    });
  });
});
