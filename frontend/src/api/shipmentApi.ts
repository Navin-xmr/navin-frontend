export type BackendShipmentStatus = 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export type ShipmentStatus = 'Pending Approval' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  createdAt: string;
}

interface BackendShipment {
  id: string;
  origin: string;
  destination: string;
  status: BackendShipmentStatus;
  createdAt: string;
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
  async getAll(options: { limit?: number } = {}) {
    const query = new URLSearchParams();

    if (typeof options.limit === 'number') {
      query.set('limit', String(options.limit));
    }

    const url = `/api/shipments${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load shipments: ${response.statusText}`);
    }

    const data = (await response.json()) as BackendShipment[];
    return data.map(parseShipment);
  },
};
