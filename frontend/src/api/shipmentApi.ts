export type BackendShipmentStatus = 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export type ShipmentStatus = 'Pending Approval' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface DeliveryProof {
  url: string;
  recipientSignatureName: string;
  uploadedAt: string;
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  createdAt: string;
  deliveryProof?: DeliveryProof;
}

interface BackendShipment {
  id: string;
  origin: string;
  destination: string;
  status: BackendShipmentStatus;
  createdAt: string;
  deliveryProof?: DeliveryProof;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

const STATUS_LABEL_MAP: Record<BackendShipmentStatus, ShipmentStatus> = {
  CREATED: 'Pending Approval',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const parseShipment = (shipment: BackendShipment): Shipment => ({
  ...shipment,
  status: STATUS_LABEL_MAP[shipment.status] ?? 'Pending Approval',
});

export const shipmentApi = {
  async getAll(options: { page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();

    if (typeof options.page === 'number') {
      query.set('page', String(options.page));
    }

    if (typeof options.limit === 'number') {
      query.set('limit', String(options.limit));
    }

    const url = `/api/shipments${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load shipments: ${response.statusText}`);
    }

    const payload = await response.json();

    let payloadData: BackendShipment[] = [];
    let meta: PaginationMeta = {
      page: options.page ?? 1,
      limit: options.limit ?? 0,
      total: 0,
    };

    if (Array.isArray(payload)) {
      payloadData = payload;
      meta = {
        page: options.page ?? 1,
        limit: options.limit ?? payloadData.length,
        total: payloadData.length,
      };
    } else {
      payloadData = Array.isArray(payload.data) ? payload.data : [];
      meta = {
        page: payload.meta?.page ?? options.page ?? 1,
        limit: payload.meta?.limit ?? options.limit ?? payloadData.length,
        total: payload.meta?.total ?? payloadData.length,
      };
    }

    return {
      shipments: payloadData.map(parseShipment),
      meta,
    };
  },
};
