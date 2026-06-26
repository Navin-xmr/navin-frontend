import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RouteMap from './RouteMap';
import { shipmentApi } from '../../../api/shipmentApi';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Polyline: () => null,
  Marker: () => null,
}));

vi.mock('react-leaflet-cluster', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="marker-cluster">{children}</div>,
}));

vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    latLngBounds: vi.fn(() => ({})),
  },
}));

const mockRoutes = [
  {
    id: 'ship-001',
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    status: 'IN_TRANSIT' as const,
    createdAt: '2026-01-01T10:00:00Z',
    originLat: 40.7128,
    originLng: -74.006,
    destinationLat: 34.0522,
    destinationLng: -118.2437,
    isDelayed: false,
    trackingNumber: 'NV-001',
  },
  {
    id: 'ship-002',
    origin: 'Chicago, IL',
    destination: 'Houston, TX',
    status: 'DELIVERED' as const,
    createdAt: '2026-01-03T09:00:00Z',
    originLat: 41.8781,
    originLng: -87.6298,
    destinationLat: 29.7604,
    destinationLng: -95.3698,
    isDelayed: false,
    trackingNumber: 'NV-002',
  },
];

describe('RouteMap', () => {
  it('renders route overview and legend filters', async () => {
    vi.spyOn(shipmentApi, 'getAllActiveWithRoutes').mockResolvedValue({ data: mockRoutes });

    render(<RouteMap />);

    expect(await screen.findByText('Route Overview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /In Transit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delayed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delivered/i })).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('hides routes when a status filter is toggled off', async () => {
    vi.spyOn(shipmentApi, 'getAllActiveWithRoutes').mockResolvedValue({ data: mockRoutes });

    render(<RouteMap />);
    await screen.findByText('2 active routes shown');

    fireEvent.click(screen.getByRole('button', { name: /Delivered/i }));

    await waitFor(() => {
      expect(screen.getByText('1 active route shown')).toBeInTheDocument();
    });
  });
});
