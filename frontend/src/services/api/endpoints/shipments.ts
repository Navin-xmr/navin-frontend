import { apiClient } from "../client";

export interface Shipment {
    id: string;
    status: "pending" | "in_transit" | "delivered";
    origin: string;
    destination: string;
    createdAt: string;
}

export interface CreateShipmentRequest {
    origin: string;
    destination: string;
}

export const shipmentApi = {
    getAll: async (): Promise<Shipment[]> => {
        const res = await apiClient.get<Shipment[]>("/shipments");
        return res.data;
    },

    getById: async (id: string): Promise<Shipment> => {
        const res = await apiClient.get<Shipment>(`/shipments/${id}`);
        return res.data;
    },

    create: async (data: CreateShipmentRequest): Promise<Shipment> => {
        const res = await apiClient.post<Shipment>("/shipments", data);
        return res.data;
    },
};
