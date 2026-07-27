import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShipmentMap from './ShipmentMap';

// Mock react-leaflet so MapContainer doesn't require a real DOM/canvas
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => null,
  Marker: () => null,
  Polyline: () => null,
  useMap: () => ({ panTo: vi.fn() }),
}));

vi.mock('leaflet', () => ({
  default: {
    divIcon: () => ({}),
    latLngBounds: vi.fn(),
  },
}));

// Mock the tracking hook
vi.mock('@hooks/useShipmentTracking', () => ({
  useShipmentTracking: vi.fn(() => ({ current: null, history: [], lastUpdated: null })),
}));

import { useShipmentTracking } from '@hooks/useShipmentTracking';
import React from 'react';

const mockTracking = vi.mocked(useShipmentTracking);

describe('ShipmentMap', () => {
  test('shows fallback when no location data', () => {
    mockTracking.mockReturnValue({ current: null, history: [], lastUpdated: null });

    render(
      <ShipmentMap
        origin="New York, NY"
        destination="Boston, MA"
      />
    );

    expect(screen.getByRole('heading', { name: /map view/i })).toBeInTheDocument();
    expect(screen.getByText('ORIGIN:')).toBeInTheDocument();
    expect(screen.getByText('DESTINATION:')).toBeInTheDocument();
    expect(screen.getByText('Location tracking unavailable')).toBeInTheDocument();
  });

  test('renders map and view button when location data is available', () => {
    mockTracking.mockReturnValue({
      current: { lat: 42.36, lng: -71.05, timestamp: '2026-02-23T09:10:00Z' },
      history: [{ lat: 42.36, lng: -71.05, timestamp: '2026-02-23T09:10:00Z' }],
      lastUpdated: '2026-02-23T09:10:00Z',
    });

    render(
      <ShipmentMap
        origin="Origin Place"
        destination="Destination Place"
        originCoords={{ lat: 40.71, lng: -74.0 }}
        destinationCoords={{ lat: 42.36, lng: -71.05 }}
      />
    );

    expect(screen.getByRole('heading', { name: /map view/i })).toBeInTheDocument();
    expect(screen.getByText('ORIGIN:')).toBeInTheDocument();
    expect(screen.getByText('DESTINATION:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View full map/i })).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });
});
