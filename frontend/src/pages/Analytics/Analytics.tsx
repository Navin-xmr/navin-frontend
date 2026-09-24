import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Percent,
} from 'lucide-react';
import Breadcrumb from '@components/common/Breadcrumb';
import { DashboardWidgetSkeleton, Skeleton } from '@components/ui/Skeleton';
import ErrorFallback from '@components/ErrorFallback/ErrorFallback';
import StatCard, { type StatCardProps } from '../../components/dashboard/StatCard/StatCard';
import ShipmentVolumeChart from '../../components/dashboard/Charts/ShipmentVolumeChart/ShipmentVolumeChart';
import DeliverySuccessChart from '../../components/dashboard/Charts/DeliverySuccessChart/DeliverySuccessChart';
import type { DailyVolume } from '../../components/dashboard/Charts/ShipmentVolumeChart/mockVolumeData';
import type { DeliveryOutcome } from '../../components/dashboard/Charts/DeliverySuccessChart/mockDeliveryData';
import AnalyticsFilters, { type AnalyticsFiltersValues } from './AnalyticsFilters';
import { useAnalytics } from './hooks/useAnalytics';
import { getStatusColorHex } from '../../utils/shipmentStatus';

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

function formatDelta(current: number, previous: number, suffix = ''): string {
  const delta = current - previous;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toLocaleString()}${suffix}`;
}

const Analytics: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFiltersValues>(defaultFilters);
  const dateRangeInvalid =
    !!filters.startDate && !!filters.endDate && filters.startDate > filters.endDate;

  const { performance, summary, isLoading, error, refetch } = useAnalytics({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const totalFromPerformance = useMemo(
    () => performance?.shipmentsByStatus.reduce((sum, item) => sum + item.total, 0) ?? 0,
    [performance],
  );

  const volumeData = useMemo<DailyVolume[]>(
    () =>
      summary?.totalShipmentsSparkline.map((count, index) => ({
        date: `P${index + 1}`,
        count,
      })) ?? [],
    [summary],
  );

  const deliveryData = useMemo<DeliveryOutcome[]>(
    () =>
      performance?.shipmentsByStatus.map((item) => ({
        status: item.status,
        count: item.total,
        color: getStatusColorHex(item.status),
      })) ?? [],
    [performance],
  );

  const regionOptions = useMemo(
    () => performance?.averageDeliveryTimeByLogisticsId.map((item) => item.logisticsId).sort() ?? [],
    [performance],
  );

  const statCards: StatCardProps[] = summary
    ? [
        {
          label: 'Total Shipments',
          value: summary.totalShipmentsThisMonth.toLocaleString(),
          trend: formatDelta(summary.totalShipmentsThisMonth, summary.totalShipmentsThisMonthPrev),
          trendType:
            summary.totalShipmentsThisMonth >= summary.totalShipmentsThisMonthPrev ? 'up' : 'down',
          icon: <Package size={18} />,
        },
        {
          label: 'On-Time Delivery Rate',
          value: `${summary.onTimeDeliveryRate}%`,
          trend: formatDelta(summary.onTimeDeliveryRate, summary.onTimeDeliveryRatePrev, '%'),
          trendType:
            summary.onTimeDeliveryRate >= summary.onTimeDeliveryRatePrev ? 'up' : 'down',
          icon: <CheckCircle2 size={18} />,
        },
        {
          label: 'Average Transit Time',
          value: `${summary.averageTransitDays}d`,
          trend: formatDelta(summary.averageTransitDays, summary.averageTransitDaysPrev, 'd'),
          trendType:
            summary.averageTransitDays <= summary.averageTransitDaysPrev ? 'up' : 'down',
          icon: <Clock size={18} />,
        },
        {
          label: 'Dispute Rate',
          value: `${summary.disputeRate}%`,
          trend: formatDelta(summary.disputeRate, summary.disputeRatePrev, '%'),
          trendType: summary.disputeRate <= summary.disputeRatePrev ? 'up' : 'down',
          icon: <Percent size={18} />,
        },
      ]
    : [];

  return (
    <div className="w-full max-w-[1080px] mx-auto px-[46px] py-6 font-sans text-white max-md:px-4 max-md:pb-[90px]">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} current="Analytics" />
      <div className="flex justify-between items-end mb-8 max-md:flex-col max-md:items-start max-md:gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight m-0 mb-1">Analytics</h1>
          <p className="text-[#94a3b8] text-sm m-0">
            Performance metrics and trends for your logistics operations
          </p>
        </div>

        <AnalyticsFilters
          values={filters}
          onChange={setFilters}
          regionOptions={regionOptions}
          disabled={isLoading}
        />
      </div>

      {dateRangeInvalid ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[#ef4444] bg-[rgba(239,68,68,0.08)]">
          <AlertTriangle size={18} className="text-[#ef4444]" />
          <p className="text-sm text-[#fecaca]">Start date must be before the end date.</p>
        </div>
      ) : error ? (
        <ErrorFallback error={error} resetError={refetch} />
      ) : isLoading ? (
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
                    <th className="text-left px-6 py-4 text-[13px] font-medium text-[#64748b] border-b border-[#1e293b]">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-[13px] font-medium text-[#64748b] border-b border-[#1e293b]">
                      Shipments
                    </th>
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
                      <td colSpan={2} className="text-center px-6 py-12 text-[#64748b]">
                        No shipment data found for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="px-6 py-4 text-xs text-[#64748b]">
              Total delayed shipments: {performance?.totalDelayedShipments.toLocaleString() ?? 0} of{' '}
              {totalFromPerformance.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
