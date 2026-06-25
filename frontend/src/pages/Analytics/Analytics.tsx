import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
} from "lucide-react";
import StatCard, { type StatCardProps } from "../../components/dashboard/StatCard/StatCard";
import ShipmentVolumeChart from "../../components/dashboard/Charts/ShipmentVolumeChart/ShipmentVolumeChart";
import DeliverySuccessChart from "../../components/dashboard/Charts/DeliverySuccessChart/DeliverySuccessChart";
import { analyticsApi } from "../../services/api/endpoints/analytics";
import { shipmentApi } from "../../services/api/endpoints/shipments";
import { anomalyApi } from "../../services/api/endpoints/anomalies";
import type { Shipment } from "../../services/api/endpoints/shipments";

interface AnalyticsMetrics {
  totalShipments: number;
  onTimeRate: number;
  avgTransitDays: number;
  activeAnomalies: number;
}

const defaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

const Analytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalShipments: 0,
    onTimeRate: 0,
    avgTransitDays: 0,
    activeAnomalies: 0,
  });
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(defaultDateRange);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [perfData, shipData, anomData] = await Promise.all([
        analyticsApi.getPerformance(dateRange.startDate, dateRange.endDate),
        shipmentApi.getAll({ limit: 1 }),
        anomalyApi.getAll({ limit: 1 }),
      ]);

      const avgMs = perfData.averageDeliveryTimeByLogisticsId.length > 0
        ? perfData.averageDeliveryTimeByLogisticsId.reduce(
            (sum, item) => sum + item.averageDeliveryTimeMs, 0,
          ) / perfData.averageDeliveryTimeByLogisticsId.length
        : 0;

      const total =
        perfData.shipmentsByStatus.reduce(
          (sum, s) => sum + s.total, 0,
        ) || 1;

      setMetrics({
        totalShipments: shipData.data.length,
        onTimeRate: Math.round(
          (1 - perfData.totalDelayedShipments / total) * 100,
        ),
        avgTransitDays: Math.round(avgMs / 86400000),
        activeAnomalies: anomData.data.filter((a) => !a.resolved).length,
      });

      const allShipments = await shipmentApi.getAll({ limit: 1000 });
      const allShipments = await shipmentApi.getAll({ limit: 100 });
      setShipments(allShipments.data);
    } catch {
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  type TrendType = "up" | "neutral" | "down";
  const statCards: Array<{ label: string; value: string; trend: string; trendType: TrendType; icon: React.ReactElement }> = [
  const statCards: StatCardProps[] = [
    {
      label: "Total Shipments",
      value: metrics.totalShipments.toLocaleString(),
      trend: `${metrics.totalShipments > 0 ? "+" : ""}${metrics.totalShipments}`,
      trendType: metrics.totalShipments > 0 ? "up" : "neutral",
      icon: <Package size={18} />,
    },
    {
      label: "On-Time Delivery Rate",
      value: `${metrics.onTimeRate}%`,
      trend: `${metrics.onTimeRate}%`,
      trendType: metrics.onTimeRate >= 80 ? "up" : metrics.onTimeRate >= 50 ? "neutral" : "down",
      icon: <CheckCircle2 size={18} />,
    },
    {
      label: "Average Transit Time",
      value: `${metrics.avgTransitDays}d`,
      trend: `${metrics.avgTransitDays} days`,
      trendType: metrics.avgTransitDays <= 3 ? "up" : "down",
      icon: <Clock size={18} />,
    },
    {
      label: "Active Anomalies",
      value: metrics.activeAnomalies.toString(),
      trend: `${metrics.activeAnomalies} unresolved`,
      trendType: metrics.activeAnomalies === 0 ? "up" : "down",
      icon: <AlertTriangle size={18} />,
    },
  ];

  return (
    <div className="w-full max-w-[1080px] mx-auto px-[46px] py-6 font-sans text-white max-md:px-4 max-md:pb-[90px]">
      <div className="flex justify-between items-end mb-8 max-md:flex-col max-md:items-start max-md:gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight m-0 mb-1">
            Analytics
          </h1>
          <p className="text-[#94a3b8] text-sm m-0">
            Performance metrics and trends for your logistics operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#14171e] border border-[#1e293b] rounded-lg px-3 py-2">
            <Calendar size={14} className="text-[#64748b]" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="bg-transparent border-none text-white text-sm outline-none w-[130px] [color-scheme:dark]"
            />
            <span className="text-[#64748b]">—</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="bg-transparent border-none text-white text-sm outline-none w-[130px] [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#14171e] border border-dashed border-[#ef4444] rounded-xl text-center gap-4">
          <AlertTriangle size={48} className="text-[#ef4444]" />
          <h3 className="text-lg font-semibold">Failed to load analytics</h3>
          <p className="text-[#94a3b8] text-sm">{error}</p>
          <button
            className="bg-[#ef4444] text-white border-none px-4 py-2 rounded-md font-medium cursor-pointer"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-[#94a3b8] text-sm">Loading analytics data...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl overflow-hidden">
              <ShipmentVolumeChart />
            </div>
            <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl overflow-hidden">
              <DeliverySuccessChart />
            </div>
          </div>

          <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1e293b]">
              <h2 className="text-base font-bold flex items-center gap-2.5">
                <Package size={18} className="text-[#3b82f6]" />
                Recent Shipments
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {[
                      "Tracking #",
                      "Origin",
                      "Destination",
                      "Status",
                      "Created",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-[13px] font-medium text-[#64748b] border-b border-[#1e293b] bg-[rgba(15,23,42,0.5)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipments.length > 0 ? (
                    shipments.slice(0, 10).map((s) => (
                      <tr key={s._id} className="group hover:bg-[rgba(255,255,255,0.02)]">
                        <td className="px-6 py-4 text-sm text-[#94a3b8] font-mono border-b border-[rgba(30,41,59,0.5)]">
                          {s.trackingNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-white border-b border-[rgba(30,41,59,0.5)]">
                          {s.origin}
                        </td>
                        <td className="px-6 py-4 text-sm text-white border-b border-[rgba(30,41,59,0.5)]">
                          {s.destination}
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-[rgba(30,41,59,0.5)]">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-[0.05em] ${
                              s.status === "DELIVERED"
                                ? "bg-[rgba(16,185,129,0.1)] text-[#10b981]"
                                : s.status === "IN_TRANSIT"
                                  ? "bg-[rgba(59,130,246,0.1)] text-[#3b82f6]"
                                  : s.status === "CANCELLED"
                                    ? "bg-[rgba(239,68,68,0.1)] text-[#ef4444]"
                                    : "bg-[rgba(100,116,139,0.1)] text-[#94a3b8]"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#94a3b8] border-b border-[rgba(30,41,59,0.5)]">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center px-6 py-12 text-[#64748b]"
                      >
                        No shipment data found for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
