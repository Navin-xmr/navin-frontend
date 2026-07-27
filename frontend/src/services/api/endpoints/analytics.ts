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

export interface KpiSparkline {
    values: number[];
}

export interface AnalyticsSummary {
    onTimeDeliveryRate: number;
    onTimeDeliveryRatePrev: number;
    onTimeDeliverySparkline: number[];
    averageTransitDays: number;
    averageTransitDaysPrev: number;
    averageTransitDaysSparkline: number[];
    totalShipmentsThisMonth: number;
    totalShipmentsThisMonthPrev: number;
    totalShipmentsSparkline: number[];
    disputeRate: number;
    disputeRatePrev: number;
    disputeRateSparkline: number[];
}

export const analyticsApi = {
    getPerformance: async (startDate: string, endDate: string): Promise<AnalyticsPerformance> => {
        const res = await apiClient.get<{ data: AnalyticsPerformance }>("/analytics/performance", {
            params: { startDate, endDate },
        });
        return res.data.data;
    },

    getSummary: async (): Promise<AnalyticsSummary> => {
        const res = await apiClient.get<{ data: AnalyticsSummary }>("/analytics/summary");
        return res.data.data;
    },
};
