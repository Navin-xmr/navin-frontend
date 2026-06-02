import { apiClient } from "../client";

export interface ShipmentsByStatus {
    status: string;
    total: number;
}

export interface DeliveryTimeByLogistics {
    logisticsId: string;
    averageDeliveryTimeMs: number;
}

export interface AnalyticsPerformance {
    startDate: string;
    endDate: string;
    shipmentsByStatus: ShipmentsByStatus[];
    averageDeliveryTimeByLogisticsId: DeliveryTimeByLogistics[];
    totalDelayedShipments: number;
}

export const analyticsApi = {
    getPerformance: async (startDate: string, endDate: string): Promise<AnalyticsPerformance> => {
        const res = await apiClient.get<{ data: AnalyticsPerformance }>("/analytics/performance", {
            params: { startDate, endDate },
        });
        return res.data.data;
    },
};
