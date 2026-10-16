import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ShipmentHistory from './ShipmentHistory';

const { mockGetAll, mockNavigate } = vi.hoisted(() => ({ mockGetAll: vi.fn(), mockNavigate: vi.fn() }));
vi.mock('../../../../services/api/endpoints/shipments', () => ({ shipmentApi: { getAll: mockGetAll } }));
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

const shipment = (id: string, updatedAt: string) => ({
  id,
  trackingNumber: id,
  _id: id,
  origin: 'Origin',
  destination: 'Destination',
  updatedAt,
  offChainMetadata: { rating: 5 },
});

describe('ShipmentHistory', () => {
  it('renders delivered shipments and supports opening shipment details', async () => {
    mockGetAll.mockResolvedValue({ data: [shipment('SHP-1', '2026-02-01T00:00:00Z')] });
    render(<ShipmentHistory />);
    expect(await screen.findByText('SHP-1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View Detail' }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/shipments/SHP-1');
  });

  it('sorts the list when the delivered-date header is clicked', async () => {
    mockGetAll.mockResolvedValue({ data: [shipment('OLDER', '2026-01-01T00:00:00Z'), shipment('NEWER', '2026-03-01T00:00:00Z')] });
    render(<ShipmentHistory />);
    await screen.findByText('NEWER');
    const rows = () => screen.getAllByRole('row').slice(1).map((row) => row.textContent ?? '');
    expect(rows()[0]).toContain('NEWER');
    fireEvent.click(screen.getByText('Delivered Date'));
    await waitFor(() => expect(rows()[0]).toContain('OLDER'));
  });

  it('shows the empty state when there are no delivered shipments', async () => {
    mockGetAll.mockResolvedValue({ data: [] });
    render(<ShipmentHistory />);
    expect(await screen.findByText('No Shipment History')).toBeInTheDocument();
  });
});
