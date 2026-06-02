import { apiClient } from "../client";

export type ShipmentStatus = "CREATED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface ShipmentMilestone {
    name: string;
    timestamp: string;
    description?: string;
}

export interface Shipment {
    _id: string;
    trackingNumber: string;
    origin: string;
    destination: string;
    enterpriseId: string;
    logisticsId: string;
    status: ShipmentStatus;
    milestones: ShipmentMilestone[];
    offChainMetadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    /** Stellar NFT token ID set by the backend after tokenization */
    stellarTokenId?: string;
    /** Stellar transaction hash for the tokenization transaction */
    stellarTxHash?: string;
}

export interface PaginatedShipments {
    data: Shipment[];
    page: number;
    limit: number;
    total: number;
}

export interface CreateShipmentRequest {
    trackingNumber?: string;
    origin: string;
    destination: string;
    enterpriseId: string;
    logisticsId: string;
    milestones?: ShipmentMilestone[];
    offChainMetadata?: Record<string, unknown>;
}

export interface GetShipmentsParams {
    status?: ShipmentStatus;
    page?: number;
    limit?: number;
}

export const shipmentApi = {
    getAll: async (params?: GetShipmentsParams): Promise<PaginatedShipments> => {
        const res = await apiClient.get<{ data: PaginatedShipments }>("/shipments", { params });
        return res.data.data;
    },

    getById: async (id: string): Promise<Shipment> => {
        const res = await apiClient.get<{ data: Shipment }>(`/shipments/${id}`);
        return res.data.data;
    },

    create: async (data: CreateShipmentRequest): Promise<Shipment> => {
        const res = await apiClient.post<{ data: Shipment }>("/shipments", data);
        return res.data.data;
    },

    patchMetadata: async (id: string, offChainMetadata: Record<string, unknown>): Promise<Shipment> => {
        const res = await apiClient.patch<{ data: Shipment }>(`/shipments/${id}`, { offChainMetadata });
        return res.data.data;
    },

    updateStatus: async (id: string, status: ShipmentStatus): Promise<Shipment> => {
        const res = await apiClient.patch<{ data: Shipment }>(`/shipments/${id}/status`, { status });
        return res.data.data;
    },

    uploadProof: async (id: string, file: File, notes?: string): Promise<Shipment> => {
        const form = new FormData();
        form.append("file", file);
        if (notes) form.append("notes", notes);
        // Do NOT set Content-Type manually — the browser/axios must set it
        // automatically so the multipart boundary is included correctly.
        const res = await apiClient.post<{ data: Shipment }>(`/shipments/${id}/proof`, form);
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/shipments/${id}`);
    },
};
