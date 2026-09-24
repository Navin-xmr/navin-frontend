import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * A dedicated axios instance for public tracking requests.
 * - Uses VITE_API_BASE_URL so it works in production.
 * - Does NOT send the Authorization header (public endpoint, no auth).
 * - Has a 30 s timeout to avoid infinite loading.
 */
const publicTrackingClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
});

export interface PublicMilestone {
  id: string;
  label: string;
  status: string;
  timestamp: string;
  location?: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

export interface PublicShipment {
  trackingNumber: string;
  status: string;
  originCity: string;
  destinationCity: string;
  expectedDelivery: string;
  milestones: PublicMilestone[];
}

export const publicTrackingApi = {
  /**
   * Fetch a shipment by tracking number.
   * The tracking number is URL-encoded to prevent path-injection attacks.
   */
  getByTrackingNumber: async (trackingNumber: string): Promise<PublicShipment> => {
    const encoded = encodeURIComponent(trackingNumber);
    const res = await publicTrackingClient.get<{ data: PublicShipment }>(
      `/api/public/shipments/${encoded}`,
    );
    return res.data.data;
  },
};
