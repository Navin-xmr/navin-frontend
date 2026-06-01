import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecentShipments from './RecentShipments';
import { shipmentApi, type Shipment } from '../../../../api/shipmentApi';

vi.mock('../../../../api/shipmentApi', () => ({
  shipmentApi: {
    getAll: vi.fn(),
  },
}));

const mockShipments: Shipment[] = [
  { id: 'SHP-1001', origin: 'Singapore', destination: 'Rotterdam', status: 'In Transit', createdAt: '2026-02-19T09:20:00Z' },
  { id: 'SHP-1002', origin: 'Mumbai', destination: 'Dubai', status: 'Delivered', createdAt: '2026-02-18T07:10:00Z' },
  { id: 'SHP-1003', origin: 'Hamburg', destination: 'Chicago', status: 'Pending Approval', createdAt: '2026-02-17T12:45:00Z' },
  { id: 'SHP-1004', origin: 'Busan', destination: 'Long Beach', status: 'In Transit', createdAt: '2026-02-16T16:30:00Z' },
  { id: 'SHP-1005', origin: 'Antwerp', destination: 'Lagos', status: 'Cancelled', createdAt: '2026-02-15T10:05:00Z' },
  { id: 'SHP-1006', origin: 'Jakarta', destination: 'Melbourne', status: 'Delivered', createdAt: '2026-02-14T14:50:00Z' },
  { id: 'SHP-1007', origin: 'Los Angeles', destination: 'Tokyo', status: 'In Transit', createdAt: '2026-02-13T06:40:00Z' },
  { id: 'SHP-1008', origin: 'Shenzhen', destination: 'San Francisco', status: 'Pending Approval', createdAt: '2026-02-12T08:35:00Z' },
  { id: 'SHP-1009', origin: 'Durban', destination: 'Santos', status: 'Delivered', createdAt: '2026-02-11T11:25:00Z' },
  { id: 'SHP-1010', origin: 'Valencia', destination: 'Algiers', status: 'In Transit', createdAt: '2026-02-10T05:15:00Z' },
  { id: 'SHP-1011', origin: 'Manila', destination: 'Seattle', status: 'Cancelled', createdAt: '2026-02-09T13:00:00Z' },
  { id: 'SHP-1012', origin: 'Jebel Ali', destination: 'Mumbai', status: 'Delivered', createdAt: '2026-02-08T19:30:00Z' },
  { id: 'SHP-1013', origin: 'Ho Chi Minh City', destination: 'Osaka', status: 'In Transit', createdAt: '2026-02-07T09:55:00Z' },
  { id: 'SHP-1014', origin: 'Colombo', destination: 'Hamburg', status: 'Pending Approval', createdAt: '2026-02-06T04:45:00Z' },
  { id: 'SHP-1015', origin: 'Alexandria', destination: 'Piraeus', status: 'Delivered', createdAt: '2026-02-05T17:20:00Z' },
];

const getFirstDataRow = () => {
  const rows = screen.getAllByRole('row');
  return rows[1];
};

describe('RecentShipments', () => {
  const getAllMock = vi.mocked(shipmentApi.getAll);

  beforeEach(() => {
    getAllMock.mockReset();
  });

  it('shows a loading skeleton while shipments are loading', async () => {
    getAllMock.mockResolvedValueOnce(mockShipments.slice(0, 5));

    render(<RecentShipments />);

    expect(screen.getByLabelText('Recent shipments loading')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('SHP-1001')).toBeInTheDocument());
  });

  it('fetches from the backend and renders recent shipments', async () => {
    getAllMock.mockResolvedValueOnce(mockShipments.slice(0, 5));

    render(<RecentShipments />);

    expect(screen.getByLabelText('Recent shipments loading')).toBeInTheDocument();
    expect(getAllMock).toHaveBeenCalledWith({ limit: 5 });

    await waitFor(() => {
      expect(screen.getByText('SHP-1001')).toBeInTheDocument();
    });
  });

  it('shows an empty state when the backend returns no shipments', async () => {
    getAllMock.mockResolvedValueOnce([]);

    render(<RecentShipments />);

    await waitFor(() => {
      expect(screen.getByText('No shipments found')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /create your first shipment/i })).toBeInTheDocument();
  });

  it('sorts by created date when header is clicked', async () => {
    getAllMock.mockResolvedValueOnce(mockShipments);

    render(<RecentShipments />);

    await waitFor(() => expect(screen.getByText('Shipment ID')).toBeInTheDocument());

    expect(within(getFirstDataRow()).getByText('SHP-1001')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sort by created date/i }));
    expect(within(getFirstDataRow()).getByText('SHP-1015')).toBeInTheDocument();
  });

  it('sorts by status and toggles direction', async () => {
    getAllMock.mockResolvedValueOnce(mockShipments);

    render(<RecentShipments />);

    await waitFor(() => expect(screen.getByText('Shipment ID')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /sort by status/i }));
    expect(within(getFirstDataRow()).getByText('Pending Approval')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sort by status/i }));
    expect(within(getFirstDataRow()).getByText('Cancelled')).toBeInTheDocument();
  });

  it('paginates with next and page number controls', async () => {
    getAllMock.mockResolvedValueOnce(mockShipments);

    render(<RecentShipments />);

    await waitFor(() => expect(screen.getByText('Shipment ID')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('SHP-1006')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('SHP-1011')).toBeInTheDocument();
  });
});

