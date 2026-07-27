import React, { useEffect, useState } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi, type AnalyticsSummary } from '../../../../services/api/endpoints/analytics';

const buildSparklinePath = (values: number[]): string => {
  if (values.length < 2) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
};

interface KpiTileProps {
  label: string;
  value: string;
  improving: boolean;
  neutral?: boolean;
  sparkline: number[];
  ariaLabel: string;
}

const KpiTile: React.FC<KpiTileProps> = ({ label, value, improving, neutral, sparkline, ariaLabel }) => {
  const trendColor = neutral ? '#94a3b8' : improving ? '#10b981' : '#ef4444';
  const TrendIcon = improving ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1e293b] bg-[#0f172a] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#64748b]">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xl font-semibold text-white">{value}</span>
        {!neutral && (
          <span style={{ color: trendColor }} aria-label={ariaLabel}>
            <TrendIcon size={16} />
          </span>
        )}
      </div>
      <svg
        viewBox="0 0 100 50"
        className="h-10 w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d={buildSparklinePath(sparkline)}
          fill="none"
          stroke={trendColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const PerformanceScorecardWidget: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    analyticsApi.getSummary()
      .then((d) => { if (active) setData(d); })
      .catch(() => { if (active) setHasError(true); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="rounded-2xl border border-[#1e293b] bg-[#14171e] p-6 shadow-sm">
      <div className="mb-5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">Performance Scorecard</p>
        <h3 className="text-lg font-semibold text-white">KPIs vs. previous period</h3>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[#1e293b]" />
          ))}
        </div>
      ) : hasError ? (
        <div className="rounded-xl border border-[#ef4444]/30 bg-[#1f1f22] p-4 text-sm text-[#fca5a5]">
          Unable to load scorecard data.
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiTile
              label="On-Time Delivery"
              value={`${data.onTimeDeliveryRate.toFixed(1)}%`}
              improving={data.onTimeDeliveryRate >= data.onTimeDeliveryRatePrev}
              sparkline={data.onTimeDeliverySparkline}
              ariaLabel={data.onTimeDeliveryRate >= data.onTimeDeliveryRatePrev ? 'Improving' : 'Worsening'}
            />
            <KpiTile
              label="Avg Transit Days"
              value={data.averageTransitDays.toFixed(1)}
              improving={data.averageTransitDays <= data.averageTransitDaysPrev}
              sparkline={data.averageTransitDaysSparkline}
              ariaLabel={data.averageTransitDays <= data.averageTransitDaysPrev ? 'Improving' : 'Worsening'}
            />
            <KpiTile
              label="Shipments This Month"
              value={data.totalShipmentsThisMonth.toLocaleString()}
              improving={data.totalShipmentsThisMonth >= data.totalShipmentsThisMonthPrev}
              sparkline={data.totalShipmentsSparkline}
              ariaLabel={data.totalShipmentsThisMonth >= data.totalShipmentsThisMonthPrev ? 'Improving' : 'Worsening'}
            />
            <KpiTile
              label="Dispute Rate"
              value={`${data.disputeRate.toFixed(1)}%`}
              improving={data.disputeRate <= data.disputeRatePrev}
              sparkline={data.disputeRateSparkline}
              ariaLabel={data.disputeRate <= data.disputeRatePrev ? 'Improving' : 'Worsening'}
            />
          </div>

          <div className="mt-5 flex items-center justify-end">
            <Link
              to="/dashboard/analytics"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#60a5fa] hover:text-white transition-colors"
            >
              View Full Analytics <ArrowUpRight size={15} />
            </Link>
          </div>
        </>
      ) : null}
    </section>
  );
};

export default PerformanceScorecardWidget;
