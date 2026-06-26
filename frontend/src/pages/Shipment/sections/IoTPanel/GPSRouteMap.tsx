import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TelemetryRecord } from './hooks/useTelemetry';

// Fix leaflet default marker icon paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const anomalyIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'leaflet-marker-anomaly',
});

interface Props {
  records: TelemetryRecord[];
}

const GPSRouteMap: React.FC<Props> = ({ records }) => {
  const sorted = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const positions: [number, number][] = sorted.map((r) => [r.latitude, r.longitude]);
  const anomalies = sorted.filter((r) => r.anomalyType === 'GPS_LOST' || r.isAnomaly);

  const center: [number, number] =
    positions.length > 0
      ? [
          positions[Math.floor(positions.length / 2)][0],
          positions[Math.floor(positions.length / 2)][1],
        ]
      : [0, 0];

  const current = positions[positions.length - 1];

  // Ensure container is sized correctly after mount
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-background-elevated text-text-secondary text-sm">
        No GPS data available
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 320 }}>
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline positions={positions} pathOptions={{ color: '#00d4c8', weight: 3 }} />
        {current && (
          <Marker position={current}>
            <Popup>Current position</Popup>
          </Marker>
        )}
        {anomalies.map((a, i) => (
          <Marker key={i} position={[a.latitude, a.longitude]} icon={anomalyIcon}>
            <Popup>{a.anomalyType ?? 'Anomaly'}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default GPSRouteMap;
