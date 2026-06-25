import { apiClient } from "../client";

export type ShipmentStatus = "CREATED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface ShipmentMilestone {
    name: string;
    timestamp: string;
    description?: string;
}

export interface Shipment {
    _id: string;
    /** Normalized from _id by the apiClient response interceptor (#202). Available on all responses. */
    id?: string;
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
    meta: {
        nextCursor: string | null;
        hasMore: boolean;
    };
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
    cursor?: string;
    limit?: number;
}

export const shipmentApi = {
    getAll: async (params?: GetShipmentsParams): Promise<PaginatedShipments> => {
        const res = await apiClient.get<{ data: Shipment[]; meta: { nextCursor: string | null; hasMore: boolean } }>("/shipments", { params });
        return { data: res.data.data, meta: res.data.meta };
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

        uploadProof: async (id: string, file: File, recipientSignatureName: string): Promise<Shipment> => {
        const form = new FormData();
        form.append("file", file);
        form.append("recipientSignatureName", recipientSignatureName);
        const res = await apiClient.post<{ data: Shipment }>(`/shipments/${id}/proof`, form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/shipments/${id}`);
    },
};
