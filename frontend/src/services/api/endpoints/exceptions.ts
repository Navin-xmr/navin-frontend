import { apiClient } from "../client";

export type ExceptionType = "DELAYED" | "DAMAGED" | "LOST" | "RETURNED" | "CUSTOMS_HOLD";
export type ExceptionStatus = "OPEN" | "RESOLVING" | "RESOLVED";

export interface ShipmentException {
    id: string;
    shipmentId: string;
    type: ExceptionType;
    status: ExceptionStatus;
    ageHours: number;
    owner: string;
    route: string;
    openedAt: string;
    resolutionHours: number;
    severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface GetExceptionsParams {
    type?: ExceptionType;
    dateRange?: "7d" | "14d" | "30d" | "all";
    route?: string;
}

export const exceptionApi = {
    getAll: async (params?: GetExceptionsParams): Promise<ShipmentException[]> => {
        const res = await apiClient.get<{ data: ShipmentException[] }>("/shipments/exceptions", { params });
        return res.data.data;
    },

    resolve: async (id: string, note?: string): Promise<ShipmentException> => {
        const res = await apiClient.patch<{ data: ShipmentException }>(`/shipments/exceptions/${id}/resolve`, { note });
        return res.data.data;
    },
};
