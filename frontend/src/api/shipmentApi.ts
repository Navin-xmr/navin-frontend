import axios from 'axios';
import type { ShipmentStatus } from '../services/api/endpoints/shipments';
import {
  readNumericField,
  resolveLocationCoords,
} from '../utils/routeCoordinates';

export type ShipmentPriority = 'URGENT' | 'STANDARD' | 'ECONOMY';

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  createdAt: string;
  priority?: ShipmentPriority;
  deliveryProof?: {
    url: string;
    recipientSignatureName: string;
    uploadedAt: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  [key: string]: unknown;
}

export interface ShipmentsResponse {
  data: Shipment[];
  meta: PaginationMeta;
}

interface BackendShipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
  deliveryProof?: {
    url?: string;
    recipientSignatureName?: string;
    uploadedAt?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface BackendResponse {
  data?: BackendShipment[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

const STATUS_MAP: Record<string, ShipmentStatus> = {
  CREATED: 'CREATED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

const PRIORITY_MAP: Record<string, ShipmentPriority> = {
  URGENT: 'URGENT',
  STANDARD: 'STANDARD',
  ECONOMY: 'ECONOMY',
};

const normalizeShipment = (shipment: BackendShipment): Shipment => {
  const rawPriority = shipment.priority ? String(shipment.priority).toUpperCase() : undefined;
  return {
    id: String(shipment.id),
    origin: String(shipment.origin),
    destination: String(shipment.destination),
    status:
      STATUS_MAP[String(shipment.status).toUpperCase()] ??
      (shipment.status as ShipmentStatus) ??
      'CREATED',
    createdAt: String(shipment.createdAt),
    priority: rawPriority ? (PRIORITY_MAP[rawPriority] ?? undefined) : undefined,
    deliveryProof: shipment.deliveryProof?.url
      ? {
        url: String(shipment.deliveryProof.url),
        recipientSignatureName: String(shipment.deliveryProof.recipientSignatureName ?? ''),
        uploadedAt: String(shipment.deliveryProof.uploadedAt ?? ''),
      }
      : undefined,
  };
};

export type ShipmentWithGps = Shipment & {
  lat?: number;
  lng?: number;
  trackingNumber?: string;
  // Optional backend flags for coloring. These may be absent.
  anomalyDetected?: boolean;
  isDelayed?: boolean;
};

export type ShipmentRoute = Shipment & {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  isDelayed?: boolean;
  trackingNumber?: string;
};

export type RouteDisplayStatus = 'IN_TRANSIT' | 'DELAYED' | 'DELIVERED';

const ACTIVE_ROUTE_STATUSES: ShipmentStatus[] = ['IN_TRANSIT', 'DELIVERED'];

export function getRouteDisplayStatus(route: ShipmentRoute): RouteDisplayStatus {
  if (route.status === 'DELIVERED') return 'DELIVERED';
  if (route.isDelayed) return 'DELAYED';
  return 'IN_TRANSIT';
}

const toShipmentRoute = (shipment: BackendShipment): ShipmentRoute | null => {
  const base = normalizeShipment(shipment);
  if (!ACTIVE_ROUTE_STATUSES.includes(base.status)) return null;

  const raw = shipment as Record<string, unknown>;
  const metadata =
    raw.offChainMetadata && typeof raw.offChainMetadata === 'object'
      ? (raw.offChainMetadata as Record<string, unknown>)
      : {};

  let originLat = readNumericField(raw, [
    'originLat',
    'origin_lat',
    'originLatitude',
    'origin_latitude',
  ]) ?? readNumericField(metadata, ['originLat', 'origin_lat']);
  let originLng = readNumericField(raw, [
    'originLng',
    'origin_lng',
    'originLongitude',
    'origin_longitude',
  ]) ?? readNumericField(metadata, ['originLng', 'origin_lng']);
  let destinationLat = readNumericField(raw, [
    'destinationLat',
    'destination_lat',
    'destinationLatitude',
    'destination_latitude',
  ]) ?? readNumericField(metadata, ['destinationLat', 'destination_lat']);
  let destinationLng = readNumericField(raw, [
    'destinationLng',
    'destination_lng',
    'destinationLongitude',
    'destination_longitude',
  ]) ?? readNumericField(metadata, ['destinationLng', 'destination_lng']);

  if (
    originLat === undefined ||
    originLng === undefined ||
    destinationLat === undefined ||
    destinationLng === undefined
  ) {
    const [resolvedOriginLat, resolvedOriginLng] = resolveLocationCoords(base.origin);
    const [resolvedDestinationLat, resolvedDestinationLng] = resolveLocationCoords(
      base.destination,
    );
    originLat ??= resolvedOriginLat;
    originLng ??= resolvedOriginLng;
    destinationLat ??= resolvedDestinationLat;
    destinationLng ??= resolvedDestinationLng;
  }

  const isDelayed =
    raw.isDelayed === true ||
    raw.is_delayed === true ||
    metadata.isDelayed === true ||
    String(raw.status ?? '').toUpperCase().includes('DELAY');

  return {
    ...base,
    originLat,
    originLng,
    destinationLat,
    destinationLng,
    isDelayed,
    trackingNumber:
      typeof raw.trackingNumber === 'string'
        ? raw.trackingNumber
        : typeof raw.tracking_number === 'string'
          ? raw.tracking_number
          : undefined,
  };
};

async function fetchAllShipmentPages(): Promise<BackendShipment[]> {
  const all: BackendShipment[] = [];
  let page = 1;
  let total = Infinity;

  while (all.length < total && page <= 50) {
    const response = await axios.get<BackendResponse>('/api/shipments', {
      params: { limit: 100, page },
    });
    const payload = response.data ?? {};
    const items = Array.isArray(payload.data) ? payload.data : [];
    all.push(...items);
    total = typeof payload.meta?.total === 'number' ? payload.meta.total : items.length;
    if (items.length === 0) break;
    page += 1;
  }

  return all;
}

export const shipmentApi = {
  async getAll(params: { limit?: number; page?: number } = {}): Promise<ShipmentsResponse> {
    const queryParams = new URLSearchParams();

    if (typeof params.limit === 'number') {
      queryParams.set('limit', String(params.limit));
    }

    if (typeof params.page === 'number') {
      queryParams.set('page', String(params.page));
    }

    const response = await axios.get<BackendResponse>('/api/shipments', {
      params: Object.fromEntries(queryParams.entries()),
    });

    const payload = response.data ?? {};
    const items = Array.isArray(payload.data) ? payload.data.map(normalizeShipment) : [];
    const meta = payload.meta ?? {};

    return {
      data: items,
      meta: {
        page: typeof meta.page === 'number' ? meta.page : params.page ?? 1,
        limit: typeof meta.limit === 'number' ? meta.limit : params.limit ?? items.length,
        total: typeof meta.total === 'number' ? meta.total : items.length,
        ...meta,
      },
    };
  },

  async patchPriority(id: string, priority: ShipmentPriority): Promise<void> {
    await axios.patch(`/api/shipments/${id}`, { priority });
  },

  async bulkUpdateStatus(
    ids: string[],
    status: ShipmentStatus,
  ): Promise<{ updated: string[]; failed: string[] }> {
    try {
      const res = await axios.patch<{ data: { updated: string[]; failed: string[] } }>(
        '/api/shipments/bulk-status',
        { ids, status },
      );
      return res.data.data ?? { updated: ids, failed: [] };
    } catch {
      // Fallback: update one-by-one so we can report partial failures
      const updated: string[] = [];
      const failed: string[] = [];
      await Promise.all(
        ids.map(async (id) => {
          try {
            await axios.patch(`/api/shipments/${id}/status`, { status });
            updated.push(id);
          } catch {
            failed.push(id);
          }
        }),
      );
      return { updated, failed };
    }
  },

  async getAllActiveWithRoutes(): Promise<{ data: ShipmentRoute[] }> {
    const items = await fetchAllShipmentPages();
    const routes = items
      .map(toShipmentRoute)
      .filter((route): route is ShipmentRoute => route !== null);
    return { data: routes };
  },

  async getAllInTransitWithGps(): Promise<{ data: ShipmentWithGps[] }> {
    const items = await fetchAllShipmentPages();
    const inTransit = items
      .map(toShipmentRoute)
      .filter(
        (route): route is ShipmentRoute => route !== null && route.status === 'IN_TRANSIT',
      )
      .map((route) => ({
        ...route,
        lat: route.destinationLat,
        lng: route.destinationLng,
      }));
    return { data: inTransit };
  },
};
