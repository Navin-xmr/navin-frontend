import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RecentShipments from './RecentShipments';
import type { Shipment } from '@services/api/endpoints/shipments';
import * as shipmentsModule from '@services/api/endpoints/shipments';

const MOCK_SHIPMENTS: Shipment[] = [
  { _id: 'SHP-1001', trackingNumber: 'TN-1001', origin: 'Singapore', destination: 'Rotterdam', status: 'IN_TRANSIT', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-19T09:20:00Z', updatedAt: '2026-02-19T09:20:00Z' },
  { _id: 'SHP-1002', trackingNumber: 'TN-1002', origin: 'Mumbai', destination: 'Dubai', status: 'DELIVERED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-18T07:10:00Z', updatedAt: '2026-02-18T07:10:00Z' },
  { _id: 'SHP-1003', trackingNumber: 'TN-1003', origin: 'Hamburg', destination: 'Chicago', status: 'CREATED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-17T12:45:00Z', updatedAt: '2026-02-17T12:45:00Z' },
  { _id: 'SHP-1004', trackingNumber: 'TN-1004', origin: 'Busan', destination: 'Long Beach', status: 'IN_TRANSIT', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-16T16:30:00Z', updatedAt: '2026-02-16T16:30:00Z' },
  { _id: 'SHP-1005', trackingNumber: 'TN-1005', origin: 'Antwerp', destination: 'Lagos', status: 'CANCELLED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-15T10:05:00Z', updatedAt: '2026-02-15T10:05:00Z' },
  { _id: 'SHP-1006', trackingNumber: 'TN-1006', origin: 'Jakarta', destination: 'Melbourne', status: 'DELIVERED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-14T14:50:00Z', updatedAt: '2026-02-14T14:50:00Z' },
  { _id: 'SHP-1007', trackingNumber: 'TN-1007', origin: 'Los Angeles', destination: 'Tokyo', status: 'IN_TRANSIT', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-13T06:40:00Z', updatedAt: '2026-02-13T06:40:00Z' },
  { _id: 'SHP-1008', trackingNumber: 'TN-1008', origin: 'Shenzhen', destination: 'San Francisco', status: 'CREATED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-12T08:35:00Z', updatedAt: '2026-02-12T08:35:00Z' },
  { _id: 'SHP-1009', trackingNumber: 'TN-1009', origin: 'Durban', destination: 'Santos', status: 'DELIVERED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-11T11:25:00Z', updatedAt: '2026-02-11T11:25:00Z' },
  { _id: 'SHP-1010', trackingNumber: 'TN-1010', origin: 'Valencia', destination: 'Algiers', status: 'IN_TRANSIT', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-10T05:15:00Z', updatedAt: '2026-02-10T05:15:00Z' },
  { _id: 'SHP-1011', trackingNumber: 'TN-1011', origin: 'Manila', destination: 'Seattle', status: 'CANCELLED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-09T13:00:00Z', updatedAt: '2026-02-09T13:00:00Z' },
  { _id: 'SHP-1012', trackingNumber: 'TN-1012', origin: 'Jebel Ali', destination: 'Mumbai', status: 'DELIVERED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-08T19:30:00Z', updatedAt: '2026-02-08T19:30:00Z' },
  { _id: 'SHP-1013', trackingNumber: 'TN-1013', origin: 'Ho Chi Minh City', destination: 'Osaka', status: 'IN_TRANSIT', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-07T09:55:00Z', updatedAt: '2026-02-07T09:55:00Z' },
  { _id: 'SHP-1014', trackingNumber: 'TN-1014', origin: 'Colombo', destination: 'Hamburg', status: 'CREATED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-06T04:45:00Z', updatedAt: '2026-02-06T04:45:00Z' },
  { _id: 'SHP-1015', trackingNumber: 'TN-1015', origin: 'Alexandria', destination: 'Piraeus', status: 'DELIVERED', enterpriseId: 'e1', logisticsId: 'l1', milestones: [], createdAt: '2026-02-05T17:20:00Z', updatedAt: '2026-02-05T17:20:00Z' },
];

const getFirstDataRow = () => {
  const rows = screen.getAllByRole('row');
  return rows[1];
};

describe('RecentShipments', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a loading skeleton before data is loaded', () => {
    render(<RecentShipments />);

    expect(screen.getByLabelText('Recent shipments loading')).toBeInTheDocument();
  });

  it('shows an empty state when there are no shipments', () => {
    render(<RecentShipments shipments={[]} />);

    expect(screen.getByText('No shipments found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your first shipment/i })).toBeInTheDocument();
  });

  it('sorts by created date when header is clicked', () => {
    render(<RecentShipments shipments={MOCK_SHIPMENTS} />);

    expect(within(getFirstDataRow()).getByText('SHP-1001')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sort by created date/i }));

    expect(within(getFirstDataRow()).getByText('SHP-1015')).toBeInTheDocument();
  });

  it('sorts by status and toggles direction', () => {
    render(<RecentShipments shipments={MOCK_SHIPMENTS} />);

    fireEvent.click(screen.getByRole('button', { name: /sort by status/i }));
    expect(within(getFirstDataRow()).getByText('Pending Approval')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sort by status/i }));
    expect(within(getFirstDataRow()).getByText('Cancelled')).toBeInTheDocument();
  });

  it('paginates with next and page number controls', () => {
    render(<RecentShipments shipments={MOCK_SHIPMENTS} />);

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('SHP-1006')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('SHP-1011')).toBeInTheDocument();
  });
});
