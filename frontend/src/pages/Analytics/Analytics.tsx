import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import Breadcrumb from "@components/common/Breadcrumb";
import StatCard, { type StatCardProps } from "../../components/dashboard/StatCard/StatCard";
import { DashboardWidgetSkeleton } from "@components/ui/Skeleton";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import ShipmentVolumeChart from "../../components/dashboard/Charts/ShipmentVolumeChart/ShipmentVolumeChart";
import DeliverySuccessChart from "../../components/dashboard/Charts/DeliverySuccessChart/DeliverySuccessChart";
import AnalyticsFilters, { type AnalyticsFiltersValues } from "./AnalyticsFilters";
import { DateRangePicker } from "../../components/ui/DateRangePicker";
import { SavedViewsPanel } from "../../components/saved-views/SavedViewsPanel";
import { analyticsApi } from "../../services/api/endpoints/analytics";
import { anomalyApi } from "../../services/api/endpoints/anomalies";
import ErrorFallback from "@components/ErrorFallback/ErrorFallback";
import { useLiveRegion } from "../../context/LiveRegionContext";

interface AnalyticsMetrics {
  onTimeRate: number;
  avgTransitDays: number;
  activeAnomalies: number;
  totalShipments: number;
}

interface DailyVolume {
  date: string;
  count: number;
}

interface DeliveryOutcome {
  status: string;
  count: number;
  color: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

const defaultFilters = (): AnalyticsFiltersValues => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    regions: [],
    shipmentTypes: [],
  };
};

const defaultDateRange = (): DateRange => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

function formatDelta(current: number, previous: number, suffix = ''): string {
  const delta = current - previous;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toLocaleString()}${suffix}`;
}

const statusColors: Record<string, string> = {
  DELIVERED: '#10b981',
  IN_TRANSIT: '#3b82f6',
  CREATED: '#94a3b8',
  CANCELLED: '#ef4444',
  DELAYED: '#f59e0b',
};

const Analytics: React.FC = () => {
  const { announce } = useLiveRegion();
  const [filters, setFilters] = useState<AnalyticsFiltersValues>(defaultFilters);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    onTimeRate: 0,
    avgTransitDays: 0,
    activeAnomalies: 0,
    totalShipments: 0,
  });
  const [performance, setPerformance] = useState<Awaited<ReturnType<typeof analyticsApi.getPerformance>> | null>(null);

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

      setPerformance(perfData);

      const avgMs =
        perfData.averageDeliveryTimeByLogisticsId.length > 0
          ? perfData.averageDeliveryTimeByLogisticsId.reduce(
              (sum, item) => sum + item.averageDeliveryTimeMs,
              0,
            ) / perfData.averageDeliveryTimeByLogisticsId.length
          : 0;

      const total =
        perfData.shipmentsByStatus.reduce((sum, s) => sum + s.total, 0) || 1;

      setMetrics({
        onTimeRate: Math.round((1 - perfData.totalDelayedShipments / total) * 100),
        avgTransitDays: Math.round(avgMs / 86400000),
        activeAnomalies: anomData.data.filter((a) => !a.resolved).length,
        totalShipments: total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, dateRangeInvalid]);

  useEffect(() => {
    void fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchData]);

  const volumeData = useMemo<DailyVolume[]>(() => [], []);

  const deliveryData = useMemo<DeliveryOutcome[]>(
    () =>
      performance?.shipmentsByStatus.map((item) => ({
        status: item.status,
        count: item.total,
        color: statusColors[item.status] ?? '#64748b',
      })) ?? [],
    [performance],
  );

  const regionOptions = useMemo(
    () =>
      performance?.averageDeliveryTimeByLogisticsId
        .map((item) => item.logisticsId)
        .sort() ?? [],
    [performance],
  );

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

  const totalFromPerformance =
    performance?.shipmentsByStatus.reduce((sum, s) => sum + s.total, 0) ?? 0;

  const statCards: StatCardProps[] = [
    {
      label: "Total Shipments",
      value: metrics.totalShipments.toLocaleString(),
      trend: formatDelta(metrics.totalShipments, 0),
      trendType: metrics.totalShipments > 0 ? "up" : "neutral",
      icon: <Package size={18} />,
    },
    {
      label: "On-Time Delivery Rate",
      value: `${metrics.onTimeRate}%`,
      trend: `${metrics.onTimeRate}%`,
      trendType:
        metrics.onTimeRate >= 80 ? "up" : metrics.onTimeRate >= 50 ? "neutral" : "down",
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
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} current="Analytics" />

      <div className="flex justify-between items-end mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight m-0 mb-1">Analytics</h1>
          <p className="text-[#94a3b8] text-sm m-0">
            Performance metrics and trends for your logistics operations
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <AnalyticsFilters
            values={filters}
            onChange={handleFiltersChange}
            regionOptions={regionOptions}
            disabled={loading}
          />
          <DateRangePicker
            value={{
              from: dateRange.startDate ? new Date(dateRange.startDate) : null,
              to: dateRange.endDate ? new Date(dateRange.endDate) : null,
            }}
            onChange={(r) =>
              setDateRange({
                startDate: r.from ? format(r.from, "yyyy-MM-dd") : "",
                endDate: r.to ? format(r.to, "yyyy-MM-dd") : "",
              })
            }
          />
        </div>
      </div>

      {/* Saved Views Panel */}
      <div className="mb-6">
        <SavedViewsPanel
          currentFilters={dateRange as unknown as Record<string, unknown>}
          onLoad={(saved) => setDateRange(saved as unknown as DateRange)}
          storageKey="navin_analytics_saved_views"
        />
      </div>

      {dateRangeInvalid ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[#ef4444] bg-[rgba(239,68,68,0.08)]">
          <AlertTriangle size={18} className="text-[#ef4444]" />
          <p className="text-sm text-[#fecaca]">Start date must be before the end date.</p>
        </div>
      ) : error ? (
        <ErrorFallback error={error} resetError={() => void fetchData()} />
      ) : loading ? (
        <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
          <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            <DashboardWidgetSkeleton count={4} />
          </div>
          <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            <DashboardWidgetSkeleton />
            <DashboardWidgetSkeleton />
          </div>
          <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl overflow-hidden p-6">
            <Skeleton width={180} height={18} className="mb-5" />
            <Skeleton width="100%" height={180} />
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
              <ShipmentVolumeChart data={volumeData} />
            </div>
            <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl overflow-hidden">
              <DeliverySuccessChart data={deliveryData} />
            </div>
          </div>

          <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1e293b]">
              <h2 className="text-base font-bold flex items-center gap-2.5">
                <Package size={18} className="text-[#3b82f6]" />
                Shipments by Status
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Status", "Count"].map((h) => (
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
                  {performance?.shipmentsByStatus.length ? (
                    performance.shipmentsByStatus.map((item) => (
                      <tr key={item.status} className="group hover:bg-[rgba(255,255,255,0.02)]">
                        <td className="px-6 py-4 text-sm text-white border-b border-[rgba(30,41,59,0.5)]">
                          {item.status}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#94a3b8] border-b border-[rgba(30,41,59,0.5)]">
                          {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-12">
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
            <p className="px-6 py-4 text-xs text-[#64748b]">
              Total delayed shipments:{' '}
              {performance?.totalDelayedShipments.toLocaleString() ?? 0} of{' '}
              {totalFromPerformance.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
