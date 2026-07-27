import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getRouteDisplayStatus,
  shipmentApi,
  type RouteDisplayStatus,
  type ShipmentRoute,
} from '../../../api/shipmentApi';
import StatusBadge from '../../../components/ui/StatusBadge/StatusBadge';
import PriorityBadge from '../../../components/shipment/PriorityBadge/PriorityBadge';
import { safeFormatDate } from '../../../utils/safeFormat';

const ROUTE_COLORS: Record<RouteDisplayStatus, string> = {
  IN_TRANSIT: '#3b82f6',
  DELAYED: '#f59e0b',
  DELIVERED: '#10b981',
};

const ROUTE_LABELS: Record<RouteDisplayStatus, string> = {
  IN_TRANSIT: 'In Transit',
  DELAYED: 'Delayed',
  DELIVERED: 'Delivered',
};

const ALL_ROUTE_STATUSES: RouteDisplayStatus[] = ['IN_TRANSIT', 'DELAYED', 'DELIVERED'];

const buildEndpointIcon = (color: string) =>
  L.divIcon({
    className: 'route-map__marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid #0b1220;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

interface RouteLineProps {
  route: ShipmentRoute;
  color: string;
  onSelect: (route: ShipmentRoute) => void;
}

const RouteLine: React.FC<RouteLineProps> = ({ route, color, onSelect }) => {
  const positions: [number, number][] = [
    [route.originLat, route.originLng],
    [route.destinationLat, route.destinationLng],
  ];

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color, weight: 10, opacity: 0 }}
        eventHandlers={{ click: () => onSelect(route) }}
      />
      <Polyline
        positions={positions}
        pathOptions={{ color, weight: 3, opacity: 0.85 }}
        eventHandlers={{ click: () => onSelect(route) }}
      />
    </>
  );
};

interface ShipmentSidebarProps {
  route: ShipmentRoute;
  onClose: () => void;
}

const ShipmentSidebar: React.FC<ShipmentSidebarProps> = ({ route, onClose }) => {
  const navigate = useNavigate();
  const displayStatus = getRouteDisplayStatus(route);

  return (
    <aside
      className="w-full md:w-80 shrink-0 border border-[#1e293b] rounded-xl p-4 bg-[#14171e] overflow-y-auto"
      aria-label="Shipment summary"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.05em] text-[#94a3b8] font-semibold mb-1">
            Shipment
          </p>
          <h3 className="m-0 text-sm font-semibold text-white">
            {route.trackingNumber ?? route.id}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
          aria-label="Close shipment summary"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-[#94a3b8] mb-1">Route</p>
          <p className="m-0 text-[#cbd5e1]">
            {route.origin} → {route.destination}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={route.status} />
          {displayStatus === 'DELAYED' && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.35)]">
              Delayed
            </span>
          )}
          <PriorityBadge priority={route.priority} />
        </div>

        <div>
          <p className="text-xs text-[#94a3b8] mb-1">Created</p>
          <p className="m-0 text-[#cbd5e1]">{safeFormatDate(route.createdAt)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/dashboard/shipments/${route.id}`)}
        className="mt-5 w-full px-4 py-2 rounded-lg bg-[#62ffff] text-black text-sm font-semibold hover:bg-[#4ae8e8] transition-colors cursor-pointer"
      >
        View Details
      </button>
    </aside>
  );
};

const RouteMap: React.FC = () => {
  const [routes, setRoutes] = useState<ShipmentRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<ShipmentRoute | null>(null);
  const [statusFilters, setStatusFilters] = useState<Record<RouteDisplayStatus, boolean>>({
    IN_TRANSIT: true,
    DELAYED: true,
    DELIVERED: true,
  });

  useEffect(() => {
    let cancelled = false;

    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await shipmentApi.getAllActiveWithRoutes();
        if (cancelled) return;
        setRoutes(response.data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unable to load shipment routes.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadRoutes();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRoutes = useMemo(
    () =>
      routes.filter((route) => {
        const displayStatus = getRouteDisplayStatus(route);
        return statusFilters[displayStatus];
      }),
    [routes, statusFilters],
  );

  const bounds = useMemo(() => {
    const latLngs: Array<[number, number]> = [];
    filteredRoutes.forEach((route) => {
      latLngs.push([route.originLat, route.originLng], [route.destinationLat, route.destinationLng]);
    });
    return latLngs.length > 0 ? L.latLngBounds(latLngs) : undefined;
  }, [filteredRoutes]);

  const toggleStatus = (status: RouteDisplayStatus) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
    setSelectedRoute(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[#94a3b8]">
        <Loader2 size={18} className="animate-spin" />
        Loading route map…
      </div>
    );
  }

  if (error) {
    return <div className="shipments-error">{error}</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="m-0 text-sm font-semibold text-white">Route Overview</h2>
            <p className="m-0 text-xs text-[#94a3b8]">
              {filteredRoutes.length} active route{filteredRoutes.length === 1 ? '' : 's'} shown
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3" aria-label="Route legend and filters">
            {ALL_ROUTE_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatus(status)}
                aria-pressed={statusFilters[status]}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  statusFilters[status]
                    ? 'border-[rgba(98,255,255,0.35)] bg-[rgba(98,255,255,0.08)] text-white'
                    : 'border-[#1e293b] bg-transparent text-[#64748b] line-through'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: ROUTE_COLORS[status] }}
                  aria-hidden="true"
                />
                {ROUTE_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[520px] max-md:h-[360px] rounded-xl overflow-hidden border border-[#1e293b]">
          {filteredRoutes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-[#94a3b8] bg-[#14171e]">
              No routes match the selected filters.
            </div>
          ) : (
            <MapContainer
              style={{ height: '100%', width: '100%' }}
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom
              worldCopyJump
              bounds={bounds}
              boundsOptions={{ padding: [24, 24] }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredRoutes.map((route) => {
                const displayStatus = getRouteDisplayStatus(route);
                const color = ROUTE_COLORS[displayStatus];
                return (
                  <RouteLine
                    key={route.id}
                    route={route}
                    color={color}
                    onSelect={setSelectedRoute}
                  />
                );
              })}

              <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
                {filteredRoutes.flatMap((route) => {
                  const displayStatus = getRouteDisplayStatus(route);
                  const color = ROUTE_COLORS[displayStatus];
                  const icon = buildEndpointIcon(color);
                  return [
                    <Marker
                      key={`${route.id}-origin`}
                      position={[route.originLat, route.originLng]}
                      icon={icon}
                      eventHandlers={{ click: () => setSelectedRoute(route) }}
                    />,
                    <Marker
                      key={`${route.id}-destination`}
                      position={[route.destinationLat, route.destinationLng]}
                      icon={icon}
                      eventHandlers={{ click: () => setSelectedRoute(route) }}
                    />,
                  ];
                })}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </div>
      </div>

      {selectedRoute && <ShipmentSidebar route={selectedRoute} onClose={() => setSelectedRoute(null)} />}
    </div>
  );
};

export default RouteMap;
