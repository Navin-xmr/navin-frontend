import { apiClient } from "../client";

export type AnomalyType =
    | "TEMPERATURE_EXCEEDED"
    | "TEMPERATURE_BELOW_MIN"
    | "HUMIDITY_EXCEEDED"
    | "HUMIDITY_BELOW_MIN"
    | "BATTERY_LOW";

export type AnomalySeverity = "LOW" | "MEDIUM" | "HIGH";

export interface Anomaly {
    _id: string;
    shipmentId: string;
    type: AnomalyType;
    severity: AnomalySeverity;
    message: string;
    timestamp: string;
    resolved: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedAnomalies {
    data: Anomaly[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface GetAnomaliesParams {
    cursor?: string;
    limit?: number;
    shipmentId?: string;
    severity?: AnomalySeverity;
}

export const anomalyApi = {
    getAll: async (params?: GetAnomaliesParams): Promise<PaginatedAnomalies> => {
        const res = await apiClient.get<PaginatedAnomalies>("/anomalies", { params });
        return res.data;
    },

    resolve: async (id: string): Promise<Anomaly> => {
        const res = await apiClient.patch<{ data: Anomaly }>(`/anomalies/${id}/resolve`);
        return res.data.data;
    },
};
