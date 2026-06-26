import axios from 'axios';
import type { ShipmentStatus } from '../services/api/endpoints/shipments';

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

  async getAllInTransitWithGps(): Promise<{ data: ShipmentWithGps[] }> {
    const response = await axios.get<{ data: ShipmentWithGps[] }>('/api/shipments/in-transit-gps');
    return { data: response.data.data ?? [] };
  },
};
