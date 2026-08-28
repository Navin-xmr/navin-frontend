import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import RoleGuard from '../../../components/auth/RoleGuard';
import type { AuthContextValue } from '../../../context/AuthContext';
import type { Shipment, PaginatedShipments } from '../../../services/api/endpoints/shipments';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const getAllMock = vi.fn<() => Promise<PaginatedShipments>>();

vi.mock('../../../services/api/endpoints/shipments', async () => {
  const actual = await vi.importActual<typeof import('../../../services/api/endpoints/shipments')>(
    '../../../services/api/endpoints/shipments'
  );
  return {
    ...actual,
    shipmentApi: {
      ...actual.shipmentApi,
      getAll: () => getAllMock(),
    },
  };
});

const mockAuthContextValue = vi.fn<() => AuthContextValue>();

vi.mock('@context/AuthContext', () => ({
  useAuthContext: () => mockAuthContextValue(),
}));

function makePaginated(data: Shipment[]): PaginatedShipments {
  return { data, meta: { nextCursor: null, hasMore: false } };
}

const inTransitShipment: Shipment = {
  _id: 'ship-101',
  trackingNumber: 'NAV-2024-101',
  origin: 'New York, NY',
  destination: 'Los Angeles, CA',
  enterpriseId: 'ent-1',
  logisticsId: 'log-1',
  status: 'IN_TRANSIT',
  milestones: [],
  createdAt: '2024-03-01T00:00:00.000Z',
  updatedAt: '2024-03-10T00:00:00.000Z',
};

const createdShipment: Shipment = {
  _id: 'ship-102',
  trackingNumber: 'NAV-2024-102',
  origin: 'Chicago, IL',
  destination: 'Houston, TX',
  enterpriseId: 'ent-1',
  logisticsId: 'log-1',
  status: 'CREATED',
  milestones: [],
  createdAt: '2024-03-02T00:00:00.000Z',
  updatedAt: '2024-03-11T00:00:00.000Z',
};

function authValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    isLoading: false,
    isAuthenticated: true,
    role: 'customer',
    userId: 'user-1',
    logout: vi.fn(),
    ...overrides,
  };
}

describe('CustomerDashboard', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getAllMock.mockReset();
    mockAuthContextValue.mockReset();
    mockAuthContextValue.mockReturnValue(authValue());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows skeleton loaders while shipments are loading, not real content', () => {
    getAllMock.mockReturnValue(new Promise(() => {}));

    const { container } = render(<CustomerDashboard />);

    expect(container.querySelectorAll('.animate-shimmer, .animate-shimmer-teal').length).toBeGreaterThan(0);
    expect(screen.queryByText('NAV-2024-101')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('active-shipment-card')).toHaveLength(0);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders both active shipments with tracking number and status badge', async () => {
    getAllMock.mockResolvedValue(makePaginated([inTransitShipment, createdShipment]));

    render(<CustomerDashboard />);

    const cards = await screen.findAllByTestId('active-shipment-card');
    expect(cards).toHaveLength(2);

    expect(within(cards[0]).getByText('NAV-2024-101')).toBeInTheDocument();
    expect(within(cards[0]).getByText('In Transit')).toBeInTheDocument();
    expect(within(cards[1]).getByText('NAV-2024-102')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Pending Approval')).toBeInTheDocument();
  });

  it('shows empty state messaging when there are no shipments', async () => {
    getAllMock.mockResolvedValue(makePaginated([]));

    render(<CustomerDashboard />);

    expect(await screen.findByText('No active shipments')).toBeInTheDocument();
    expect(screen.getByText('No past shipments yet')).toBeInTheDocument();
  });

  it('renders an error message and does not throw when the API call fails', async () => {
    getAllMock.mockRejectedValue(new Error('Network error'));

    expect(() => render(<CustomerDashboard />)).not.toThrow();

    expect(await screen.findByText('Failed to load dashboard')).toBeInTheDocument();
  });

  it('navigates to the shipment detail page when a shipment card is clicked', async () => {
    getAllMock.mockResolvedValue(makePaginated([inTransitShipment]));

    render(<CustomerDashboard />);

    const card = await screen.findByTestId('active-shipment-card');
    fireEvent.click(card);

    expect(navigateMock).toHaveBeenCalledWith('/dashboard/shipments/ship-101');
  });

  it('blocks access for a company-role user via RoleGuard', () => {
    getAllMock.mockResolvedValue(makePaginated([]));
    mockAuthContextValue.mockReturnValue(authValue({ role: 'company' }));

    render(
      <MemoryRouter initialEntries={['/dashboard/customer']}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={['customer']} />}>
            <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          </Route>
          <Route path="/dashboard" element={<div>Company Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Company Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('My Shipments')).not.toBeInTheDocument();
  });

  it('allows access for a customer-role user via RoleGuard', async () => {
    getAllMock.mockResolvedValue(makePaginated([]));
    mockAuthContextValue.mockReturnValue(authValue({ role: 'customer' }));

    render(
      <MemoryRouter initialEntries={['/dashboard/customer']}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={['customer']} />}>
            <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          </Route>
          <Route path="/dashboard" element={<div>Company Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('My Shipments')).toBeInTheDocument();
  });
});
