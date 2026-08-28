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
    id?: string;
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
    meta: {
        nextCursor: string | null;
        hasMore: boolean;
    };
}

export type AnomalyStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

export interface GetAnomaliesParams {
    cursor?: string;
    limit?: number;
    shipmentId?: string;
    severity?: AnomalySeverity;
    status?: AnomalyStatus;
}

const normalizePaginatedAnomalies = (resData: unknown): PaginatedAnomalies => {
    if (!resData) {
        return { data: [], meta: { nextCursor: null, hasMore: false } };
    }

    if (Array.isArray(resData)) {
        return {
            data: resData as Anomaly[],
            meta: { nextCursor: null, hasMore: false },
        };
    }

    if (typeof resData !== "object") {
        return { data: [], meta: { nextCursor: null, hasMore: false } };
    }

    const payload = resData as Record<string, unknown>;

    let rawItems: unknown = payload.data;
    let metaObj: unknown = payload.meta;

    if (rawItems && typeof rawItems === "object" && !Array.isArray(rawItems) && "data" in (rawItems as Record<string, unknown>)) {
        const nested = rawItems as Record<string, unknown>;
        rawItems = nested.data;
        if (!metaObj && nested.meta) {
            metaObj = nested.meta;
        }
    }

    const data = Array.isArray(rawItems) ? (rawItems as Anomaly[]) : [];
    const metaRecord = (metaObj && typeof metaObj === "object" ? metaObj : {}) as Record<string, unknown>;

    return {
        data,
        meta: {
            nextCursor: typeof metaRecord.nextCursor === "string" ? metaRecord.nextCursor : null,
            hasMore: Boolean(metaRecord.hasMore),
        },
    };
};

const extractAnomalyItem = (resData: unknown): Anomaly => {
    if (!resData || typeof resData !== "object") {
        return resData as Anomaly;
    }
    const payload = resData as Record<string, unknown>;
    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
        return payload.data as Anomaly;
    }
    return payload as unknown as Anomaly;
};

export const anomalyApi = {
    getAll: async (params?: GetAnomaliesParams): Promise<PaginatedAnomalies> => {
        const res = await apiClient.get<unknown>("/anomalies", { params });
        return normalizePaginatedAnomalies(res.data ?? res);
    },

    resolve: async (id: string): Promise<Anomaly> => {
        const res = await apiClient.patch<unknown>(`/anomalies/${id}/resolve`);
        return extractAnomalyItem(res.data ?? res);
    },

    acknowledge: async (id: string): Promise<Anomaly> => {
        const res = await apiClient.patch<unknown>(`/anomalies/${id}/acknowledge`);
        return extractAnomalyItem(res.data ?? res);
    },
};
