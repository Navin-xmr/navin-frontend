import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Breadcrumb from "@components/common/Breadcrumb";
import StatCard, { type StatCardProps } from "../../components/dashboard/StatCard/StatCard";
import ShipmentVolumeChart from "../../components/dashboard/Charts/ShipmentVolumeChart/ShipmentVolumeChart";
import DeliverySuccessChart from "../../components/dashboard/Charts/DeliverySuccessChart/DeliverySuccessChart";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import DashboardWidgetSkeleton from "../../components/ui/Skeleton/DashboardWidgetSkeleton";
import AnalyticsFilters, { type AnalyticsFiltersValues } from "./AnalyticsFilters";
import { analyticsApi } from "../../services/api/endpoints/analytics";
import { shipmentApi } from "../../services/api/endpoints/shipments";
import { anomalyApi } from "../../services/api/endpoints/anomalies";
import type { Shipment } from "../../services/api/endpoints/shipments";
import { useLiveRegion } from "../../context/LiveRegionContext";

interface AnalyticsMetrics {
  onTimeRate: number;
  avgTransitDays: number;
  activeAnomalies: number;
}

const defaultFilters = (): AnalyticsFiltersValues => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
    regions: [],
    shipmentTypes: [],
  };
};

const Analytics: React.FC = () => {
  const { announce } = useLiveRegion();
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    onTimeRate: 0,
    avgTransitDays: 0,
    activeAnomalies: 0,
  });
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFiltersValues>(defaultFilters);

  const dateRangeInvalid =
    !!filters.startDate && !!filters.endDate && filters.startDate > filters.endDate;

  const fetchData = useCallback(async () => {
    if (dateRangeInvalid) return;
    try {
      setLoading(true);
      setError(null);

      const [perfData, anomData] = await Promise.all([
        analyticsApi.getPerformance(filters.startDate, filters.endDate),
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
        onTimeRate: Math.round(
          (1 - perfData.totalDelayedShipments / total) * 100,
        ),
        avgTransitDays: Math.round(avgMs / 86400000),
        activeAnomalies: anomData.data.filter((a) => !a.resolved).length,
      });

      const allShipments = await shipmentApi.getAll({ limit: 100 });
      setShipments(allShipments.data);
    } catch {
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, dateRangeInvalid]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
  }, [fetchData]);

  // Region and shipment type aren't tracked as dedicated fields on the shipment
  // record today, so "Region" filters by origin city and "Shipment Type" filters
  // by the existing priority tier (URGENT/STANDARD/ECONOMY) — the closest
  // categorical attributes available. Both apply client-side to the shipments
  // already loaded for the selected date range; the performance/anomaly stat
  // cards are date-range scoped only, since the backend has no region/type
  // breakdown for those endpoints.
  const regionOptions = useMemo(
    () => Array.from(new Set(shipments.map((s) => s.origin))).sort(),
    [shipments],
  );

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesRegion =
        filters.regions.length === 0 || filters.regions.includes(s.origin);
      const matchesType =
        filters.shipmentTypes.length === 0 ||
        (s.priority ? filters.shipmentTypes.includes(s.priority) : false);
      return matchesRegion && matchesType;
    });
  }, [shipments, filters.regions, filters.shipmentTypes]);

  const filtersActive = filters.regions.length > 0 || filters.shipmentTypes.length > 0;

  const handleFiltersChange = (next: AnalyticsFiltersValues) => {
    setFilters(next);
    const nextActive = next.regions.length > 0 || next.shipmentTypes.length > 0;
    if (nextActive) {
      announce("Analytics filters updated.");
    } else if (filtersActive) {
      announce("Filters cleared.");
    }
  };

  const statCards: StatCardProps[] = [
    {
      label: "Total Shipments",
      value: filteredShipments.length.toLocaleString(),
      trend: `${filteredShipments.length > 0 ? "+" : ""}${filteredShipments.length}`,
      trendType: filteredShipments.length > 0 ? "up" : "neutral",
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
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }]} current="Analytics" />
      <div className="flex justify-between items-end mb-8 max-md:flex-col max-md:items-start max-md:gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight m-0 mb-1">
            Analytics
          </h1>
          <p className="text-[#94a3b8] text-sm m-0">
            Performance metrics and trends for your logistics operations
          </p>
        </div>

        <AnalyticsFilters
          values={filters}
          onChange={handleFiltersChange}
          regionOptions={regionOptions}
          disabled={loading}
        />
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
        <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading analytics data…</span>
          <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-background-card border border-border rounded-2xl p-5">
                <div className="flex justify-between items-start mb-5">
                  <Skeleton width={40} height={40} rounded="lg" />
                  <Skeleton width={48} height={14} />
                </div>
                <Skeleton width={90} height={12} className="mb-2" />
                <Skeleton width={70} height={28} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            <DashboardWidgetSkeleton />
            <DashboardWidgetSkeleton />
          </div>

          <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1e293b]">
              <Skeleton width={160} height={18} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }, (_, j) => (
                        <td key={j} className="px-6 py-4 border-b border-[rgba(30,41,59,0.5)]">
                          <Skeleton width={j === 3 ? 70 : 100} height={j === 3 ? 22 : 16} rounded={j === 3 ? 'full' : 'md'} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                  {filteredShipments.length > 0 ? (
                    filteredShipments.slice(0, 10).map((s) => (
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
                      <td colSpan={5} className="px-6 py-12">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <p className="text-[#64748b] text-sm">
                            {filtersActive
                              ? "No shipments match the selected filters."
                              : "No shipment data found for the selected period."}
                          </p>
                          {filtersActive && (
                            <button
                              type="button"
                              onClick={() =>
                                handleFiltersChange({ ...filters, regions: [], shipmentTypes: [] })
                              }
                              className="text-xs text-[#3b82f6] hover:underline cursor-pointer"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
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
