import React, { useEffect, useRef } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useShipmentTracking } from '@hooks/useShipmentTracking';
import type { TrackingPoint } from '@hooks/useShipmentTracking';

export interface Coords {
  lat: number;
  lng: number;
}

export interface ShipmentMapProps {
  shipmentId?: string;
  origin: string;
  destination: string;
  originCoords?: Coords;
  destinationCoords?: Coords;
  initialLocation?: TrackingPoint;
}

const truckIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:#00d4c8;border:3px solid #fff;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    font-size:16px;line-height:1;
  ">🚛</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const pinIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:12px;height:12px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

/** Smoothly pan the map to the new vehicle position */
function MapPanner({ position }: { position: [number, number] }) {
  const map = useMap();
  const prev = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!prev.current || prev.current[0] !== position[0] || prev.current[1] !== position[1]) {
      map.panTo(position, { animate: true, duration: 1 });
      prev.current = position;
    }
  }, [map, position]);
  return null;
}

const ShipmentMap: React.FC<ShipmentMapProps> = ({
  shipmentId,
  origin,
  destination,
  originCoords,
  destinationCoords,
  initialLocation,
}) => {
  const tracking = useShipmentTracking(shipmentId, initialLocation);
  const hasLocation = tracking.current !== null;

  const currentPos: [number, number] | null = tracking.current
    ? [tracking.current.lat, tracking.current.lng]
    : null;

  const historyPositions: [number, number][] = tracking.history.map((p) => [p.lat, p.lng]);

  const destPos: [number, number] | null = destinationCoords
    ? [destinationCoords.lat, destinationCoords.lng]
    : null;

  const originPos: [number, number] | null = originCoords
    ? [originCoords.lat, originCoords.lng]
    : null;

  // Default center: use current location, else origin, else world center
  const center: [number, number] = currentPos ?? originPos ?? [20, 0];

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h3 className="font-['Bebas_Neue',sans-serif] text-2xl font-normal tracking-[0.04em] text-white m-0">
          MAP <span className="text-[#00d4c8]">VIEW</span>
        </h3>
        <div className="flex gap-6 text-xs text-[rgba(200,230,240,0.75)]">
          <span>
            <span className="font-semibold text-[rgba(200,230,240,0.9)]">ORIGIN:</span> {origin}
          </span>
          <span>
            <span className="font-semibold text-[rgba(200,230,240,0.9)]">DESTINATION:</span>{' '}
            {destination}
          </span>
        </div>
      </div>

      {!hasLocation ? (
        <div className="h-64 flex items-center justify-center rounded-xl border border-[rgba(0,180,160,0.2)] bg-[rgba(8,40,50,0.4)] text-[rgba(200,230,240,0.5)] text-sm">
          Location tracking unavailable
        </div>
      ) : (
        <>
          <div className="h-72 md:h-64 rounded-xl overflow-hidden border border-[rgba(0,180,160,0.3)]">
            <MapContainer
              style={{ height: '100%', width: '100%' }}
              center={center}
              zoom={6}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {currentPos && <MapPanner position={currentPos} />}

              {/* Route history polyline (solid) */}
              {historyPositions.length >= 2 && (
                <Polyline
                  positions={historyPositions}
                  pathOptions={{ color: '#00d4c8', weight: 3, opacity: 0.85 }}
                />
              )}

              {/* Dashed line from current position to destination */}
              {currentPos && destPos && (
                <Polyline
                  positions={[currentPos, destPos]}
                  pathOptions={{
                    color: '#94a3b8',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '8 6',
                  }}
                />
              )}

              {/* Origin marker */}
              {originPos && <Marker position={originPos} icon={pinIcon('#10b981')} />}

              {/* Destination marker */}
              {destPos && <Marker position={destPos} icon={pinIcon('#f59e0b')} />}

              {/* Current vehicle marker */}
              {currentPos && <Marker position={currentPos} icon={truckIcon} />}
            </MapContainer>
          </div>

          {tracking.lastUpdated && (
            <p className="mt-2 text-xs text-[rgba(200,230,240,0.5)] text-right">
              Last updated: {formatTimestamp(tracking.lastUpdated)}
            </p>
          )}

          <div className="mt-2 flex justify-end">
            <button
              aria-label="View full map"
              type="button"
              className="px-4 py-1.5 rounded-lg border border-[rgba(0,212,200,0.5)] text-[#00d4c8] text-xs font-semibold hover:bg-[rgba(0,212,200,0.1)] transition-colors cursor-pointer"
            >
              VIEW FULL MAP
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipmentMap;
