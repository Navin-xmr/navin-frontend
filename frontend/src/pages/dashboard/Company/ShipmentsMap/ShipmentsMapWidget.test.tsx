import type { PropsWithChildren } from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { MapContainerProps, MarkerProps } from 'react-leaflet';
import L from 'leaflet';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shipmentApi, type ShipmentWithGps } from '../../../../api/shipmentApi';
import ShipmentsMapWidget from './ShipmentsMapWidget';

const { mapContainerMock, markerMock } = vi.hoisted(() => ({
  mapContainerMock: vi.fn<(props: MapContainerProps) => void>(),
  markerMock: vi.fn<(props: MarkerProps) => void>(),
}));

// Keep Leaflet's geometry and icons, but replace map rendering so the tests do
// not depend on jsdom layout, map tiles, or network requests.
vi.mock('react-leaflet', () => ({
  MapContainer: (props: PropsWithChildren<MapContainerProps>) => {
    mapContainerMock(props);
    return <div data-testid="shipments-map">{props.children}</div>;
  },
  TileLayer: () => null,
  Marker: (props: PropsWithChildren<MarkerProps>) => {
    markerMock(props);
    return <div data-testid="shipment-marker">{props.children}</div>;
  },
  Popup: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

vi.mock('react-leaflet-cluster', () => ({
  default: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('../../../../api/shipmentApi', () => ({
  shipmentApi: { getAllInTransitWithGps: vi.fn() },
}));

const mockGetShipments = vi.mocked(shipmentApi.getAllInTransitWithGps);

function makeShipment(overrides: Partial<ShipmentWithGps> = {}): ShipmentWithGps {
  return {
    id: 'shipment-1',
    trackingNumber: 'NAV-001',
    origin: 'London',
    destination: 'Paris',
    status: 'IN_TRANSIT',
    createdAt: '2026-01-01T10:00:00Z',
    originLat: 51.5,
    originLng: -0.1,
    destinationLat: 48.8,
    destinationLng: 2.3,
    lat: 48.8,
    lng: 2.3,
    ...overrides,
  };
}

function renderWidget() {
  return render(<MemoryRouter><ShipmentsMapWidget /></MemoryRouter>);
}

describe('ShipmentsMapWidget', () => {
  beforeEach(() => {
    mockGetShipments.mockReset();
    mapContainerMock.mockClear();
    markerMock.mockClear();
    mockGetShipments.mockResolvedValue({ data: [] });
  });

  it('shows the loading indicator while the shipment request is pending', () => {
    mockGetShipments.mockReturnValue(new Promise<{ data: ShipmentWithGps[] }>(() => {}));
    renderWidget();

    expect(screen.getByRole('heading', { name: 'Active Shipments' })).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.getByTestId('shipments-map')).toBeInTheDocument();
    expect(screen.queryAllByTestId('shipment-marker')).toHaveLength(0);
    expect(screen.queryByText('0 active')).not.toBeInTheDocument();
    expect(mockGetShipments).toHaveBeenCalledTimes(1);
  });

  it('shows zero active shipments and the world map when there are no shipments', async () => {
    renderWidget();

    expect(await screen.findByText('0 active')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('shipment-marker')).toHaveLength(0);
    expect(mapContainerMock).toHaveBeenLastCalledWith(expect.objectContaining({
      center: [20, 0],
      zoom: 2,
      bounds: undefined,
    }));
    expect(markerMock).not.toHaveBeenCalled();
  });

  it('renders shipment counts, positioned status markers, and popup details', async () => {
    const shipments = [
      makeShipment({ id: 'shipment / one', trackingNumber: 'NAV-001' }),
      makeShipment({ id: 'shipment-2', trackingNumber: undefined, lat: 40.7, lng: -74, isDelayed: true }),
      makeShipment({ id: 'shipment-3', trackingNumber: 'NAV-003', lat: 35.7, lng: 139.7, anomalyDetected: true, isDelayed: true }),
    ];
    mockGetShipments.mockResolvedValue({ data: shipments });
    renderWidget();

    expect(await screen.findByText('3 active')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    const markers = screen.getAllByTestId('shipment-marker');
    expect(markers).toHaveLength(3);
    for (const [index, shipment] of shipments.entries()) {
      const popup = within(markers[index]);
      expect(popup.getByText(shipment.trackingNumber ?? shipment.id)).toBeInTheDocument();
      expect(popup.getByText('London → Paris')).toBeInTheDocument();
      expect(popup.getByText('Status: IN_TRANSIT')).toBeInTheDocument();
      expect(popup.getByRole('link', { name: 'View' })).toHaveAttribute(
        'href', `/shipments/${encodeURIComponent(shipment.id)}`,
      );
    }
    const renderedMarkers = markerMock.mock.calls.slice(-shipments.length);
    expect(renderedMarkers.map(([props]) => props.position)).toEqual([
      [48.8, 2.3], [40.7, -74], [35.7, 139.7],
    ]);
    const colors = ['#3b82f6', '#f59e0b', '#ef4444'];
    renderedMarkers.forEach(([props], index) => {
      expect(props.icon?.options).toEqual(expect.objectContaining({
        html: expect.stringContaining(colors[index]),
      }));
    });
    expect(mapContainerMock.mock.lastCall?.[0].bounds).toEqual(
      L.latLngBounds([[48.8, 2.3], [40.7, -74], [35.7, 139.7]]),
    );
  });

  it('shows a failure indicator without shipment markers when the request fails', async () => {
    mockGetShipments.mockRejectedValue(new Error('Network error'));
    renderWidget();

    expect(await screen.findByText('Failed to load')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    expect(screen.queryByText('0 active')).not.toBeInTheDocument();
    expect(screen.getByTestId('shipments-map')).toBeInTheDocument();
    expect(screen.queryAllByTestId('shipment-marker')).toHaveLength(0);
  });
});
