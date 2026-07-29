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
    <div className="mb-10 w-full">
      {/* map-header: flex row on md+, column + centered on mobile */}
      <div className="flex justify-between items-end mb-6 max-md:flex-col max-md:items-center max-md:gap-4 max-md:text-center">
        {/* map-title */}
        <h3 className="font-['Bebas_Neue',sans-serif] text-[2.5rem] font-normal tracking-[0.04em] text-white m-0">
          MAP <span className="text-[#00d4c8]">VIEW</span>
        </h3>

        {/* map-stats */}
        <div className="flex gap-8 text-right max-md:text-center">
          {/* stat */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] font-semibold text-[rgba(0,212,200,0.6)] tracking-[0.1em] uppercase">
              Origin
            </span>
            <span className="text-[0.85rem] text-[rgba(200,230,240,0.9)] max-w-[250px] max-md:max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
              {origin}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] font-semibold text-[rgba(0,212,200,0.6)] tracking-[0.1em] uppercase">
              Destination
            </span>
            <span className="text-[0.85rem] text-[rgba(200,230,240,0.9)] max-w-[250px] max-md:max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
              {destination}
            </span>
          </div>
        </div>
      </div>

      {/* map-placeholder */}
      <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden border border-[rgba(0,212,200,0.2)] bg-[rgba(8,40,50,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {!hasLocation ? (
          <div className="absolute inset-0 flex items-center justify-center text-[rgba(200,230,240,0.5)] text-sm">
            Location tracking unavailable
          </div>
        ) : (
          <>
            {/* map-image: opacity + filter applied inline on MapContainer style */}
            <MapContainer
              style={{
                height: '100%',
                width: '100%',
                opacity: 0.8,
                filter: 'saturate(0.8) brightness(0.9)',
              }}
              center={center}
              zoom={6}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {currentPos && <MapPanner position={currentPos} />}

              {historyPositions.length >= 2 && (
                <Polyline
                  positions={historyPositions}
                  pathOptions={{ color: '#00d4c8', weight: 3, opacity: 0.85 }}
                />
              )}

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

              {originPos && <Marker position={originPos} icon={pinIcon('#10b981')} />}
              {destPos && <Marker position={destPos} icon={pinIcon('#f59e0b')} />}
              {currentPos && <Marker position={currentPos} icon={truckIcon} />}
            </MapContainer>

            {/* map-overlay: radial gradient overlay, non-interactive */}
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle,rgba(0,212,200,0.05)_0%,transparent_70%)] pointer-events-none" />
          </>
        )}
      </div>

      {tracking.lastUpdated && (
        <p className="mt-2 text-xs text-[rgba(200,230,240,0.5)] text-right">
          Last updated: {formatTimestamp(tracking.lastUpdated)}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        {/* view-full-map-btn */}
        <button
          aria-label="View full map"
          type="button"
          className="font-['Bebas_Neue',sans-serif] text-[1.25rem] tracking-[0.05em] px-10 py-3 bg-[rgba(0,212,200,0.1)] text-[#62ffff] border-[1.5px] border-[#00d4c8] rounded-xl cursor-pointer backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_0_15px_rgba(0,212,200,0.2)] hover:bg-[#00d4c8] hover:text-black hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(0,212,200,0.4)]"
        >
          VIEW FULL MAP
        </button>
      </div>
    </div>
  );
};

export default ShipmentMap;
