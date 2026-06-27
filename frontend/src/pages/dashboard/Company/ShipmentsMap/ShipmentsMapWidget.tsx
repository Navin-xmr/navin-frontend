import React, { useEffect, useMemo, useState } from 'react';
import { Marker, Popup, TileLayer } from 'react-leaflet';
import { MapContainer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { shipmentApi, type ShipmentWithGps } from '../../../../api/shipmentApi';
import { Link } from 'react-router-dom';


// Fix default marker icon paths for webpack/vite environments
// (Markers use divIcon, so this is intentionally a no-op.)
const fixLeafletIcon = () => {
    return;
};


type MarkerColor = 'blue' | 'orange' | 'red';

const colorToClass = (c: MarkerColor) => {
    switch (c) {
        case 'orange':
            return '#f59e0b';
        case 'red':
            return '#ef4444';
        default:
            return '#3b82f6';
    }
};

const buildMarkerIcon = (color: MarkerColor) => {
    const html = `
    <div style="
      width: 16px;
      height: 16px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${colorToClass(color)};
      border: 2px solid #0b1220;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    "></div>
  `;

    return L.divIcon({
        className: 'shipments-map__marker',
        html,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8],
    });
};

const getMarkerColor = (s: ShipmentWithGps): MarkerColor => {
    // Primary: anomaly/delay flags if present.
    if (typeof s.anomalyDetected === 'boolean' && s.anomalyDetected) return 'red';
    if (typeof s.isDelayed === 'boolean' && s.isDelayed) return 'orange';

    // Fallback: map from more detailed status strings if backend provides them.
    const statusUpper = String(s.status ?? '').toUpperCase();
    if (statusUpper.includes('ANOM')) return 'red';
    if (statusUpper.includes('DELAY') || statusUpper.includes('LATE')) return 'orange';

    return 'blue';
};

const ShipmentsMapWidget: React.FC = () => {
    const [shipments, setShipments] = useState<ShipmentWithGps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const icons = useMemo(() => {
        return {
            blue: buildMarkerIcon('blue'),
            orange: buildMarkerIcon('orange'),
            red: buildMarkerIcon('red'),
        } as const;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fixLeafletIcon();
        let cancelled = false;

        const run = async () => {
            try {
                setIsLoading(true);
                setHasError(false);
                const res = await shipmentApi.getAllInTransitWithGps();
                if (cancelled) return;
                setShipments(res.data);
            } catch {
                if (cancelled) return;
                setHasError(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, []);

    const bounds = useMemo(() => {
        const latLngs: Array<[number, number]> = shipments
            .filter((s: ShipmentWithGps) => typeof s.lat === 'number' && typeof s.lng === 'number')
            .map((s: ShipmentWithGps) => [s.lat as number, s.lng as number]);


        if (!latLngs.length) return undefined;

        const b = L.latLngBounds(latLngs as L.LatLngExpression[]);
        return b;
    }, [shipments]);

    return (
        <div className="bg-[#14171e] border border-[#1e293b] rounded-xl p-4 max-md:p-3">
            <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                    <h3 className="m-0 text-sm font-semibold">Active Shipments</h3>
                    <p className="m-0 text-xs text-[#94a3b8]">World overview of in-transit shipments</p>
                </div>
                {hasError ? (
                    <div className="text-xs text-[#ef4444] font-medium">Failed to load</div>
                ) : isLoading ? (
                    <div className="text-xs text-[#94a3b8] font-medium">Loading…</div>
                ) : (
                    <div className="text-xs text-[#94a3b8] font-medium">{shipments.length} active</div>
                )}
            </div>

            <div className="h-[400px] max-md:h-[250px] rounded-lg overflow-hidden">
                <MapContainer
                    style={{ height: '100%', width: '100%' }}
                    center={[20, 0]}
                    zoom={2}
                    scrollWheelZoom={true}
                    worldCopyJump={true}
                    // If we have bounds, zoom to them; otherwise keep default world view.
                    bounds={bounds as any}
                    boundsOptions={{ padding: [20, 20] }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MarkerClusterGroup
                        chunkedLoading
                        showCoverageOnHover={false}
                    >
                        {shipments
                            .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
                            .map((s) => {
                                const color = getMarkerColor(s);
                                const icon = icons[color];

                                return (
                                    <Marker key={s.id} position={[s.lat as number, s.lng as number]} icon={icon}>
                                        <Popup>
                                            <div className="min-w-[240px]">
                                                <div className="text-xs uppercase tracking-[0.05em] text-[#94a3b8] font-semibold mb-2">
                                                    Shipment
                                                </div>
                                                <div className="text-sm font-semibold mb-1">{s.trackingNumber ?? s.id}</div>
                                                <div className="text-xs text-[#94a3b8] mb-3">
                                                    {s.origin} → {s.destination}
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="text-xs text-[#94a3b8]">Status: {s.status}</div>
                                                    <Link
                                                        to={`/shipments/${encodeURIComponent(String(s.id))}`}
                                                        className="text-xs font-semibold text-[#3b82f6] no-underline hover:underline"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>
        </div>
    );
};

export default ShipmentsMapWidget;

