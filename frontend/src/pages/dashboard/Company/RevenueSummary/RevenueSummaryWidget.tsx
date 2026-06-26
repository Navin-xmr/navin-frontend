import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { settlementsApi } from '../../../../services/api/endpoints/settlements';

export type RevenuePeriod = 'week' | 'month' | 'quarter';

interface RevenueSummaryData {
  totalReleased: number;
  totalInEscrow: number;
  totalPending: number;
  sparkline: number[];
}

const formatUsdc = (value: number) => `USDC ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const buildSparklinePath = (values: number[]) => {
  if (values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const RevenueSummaryWidget: React.FC = () => {
  const [period, setPeriod] = useState<RevenuePeriod>('month');
  const [data, setData] = useState<RevenueSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const response = await settlementsApi.getSummary(period);
        if (isMounted) {
          setData(response);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [period]);

  const sparklinePath = useMemo(() => (data ? buildSparklinePath(data.sparkline) : ''), [data]);

  return (
    <section className="rounded-2xl border border-[#1e293b] bg-[#14171e] p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">Revenue Summary</p>
          <h3 className="text-lg font-semibold text-white">USDC settlement activity</h3>
        </div>
        <div className="flex rounded-full border border-[#1e293b] bg-[#0f172a] p-1" role="tablist" aria-label="Revenue period">
          {(['week', 'month', 'quarter'] as RevenuePeriod[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={period === value}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${period === value ? 'bg-[#2563eb] text-white' : 'text-[#94a3b8] hover:text-white'}`}
              onClick={() => setPeriod(value)}
            >
              {value === 'week' ? 'This Week' : value === 'month' ? 'This Month' : 'This Quarter'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-5 w-2/3 animate-pulse rounded bg-[#1e293b]" />
          <div className="h-10 w-full animate-pulse rounded bg-[#1e293b]" />
          <div className="h-16 w-full animate-pulse rounded bg-[#1e293b]" />
        </div>
      ) : hasError ? (
        <div className="rounded-xl border border-[#ef4444]/30 bg-[#1f1f22] p-4 text-sm text-[#fca5a5]">
          Unable to load revenue summary right now.
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-4">
              <p className="text-sm text-[#94a3b8]">Total USDC Released This Month</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatUsdc(data.totalReleased)}</p>
            </div>
            <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-4">
              <p className="text-sm text-[#94a3b8]">Total USDC In Escrow</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatUsdc(data.totalInEscrow)}</p>
            </div>
            <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-4">
              <p className="text-sm text-[#94a3b8]">Total USDC Pending</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatUsdc(data.totalPending)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#1e293b] bg-[#0f172a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-[#cbd5e1]">
                <TrendingUp size={16} className="text-[#10b981]" />
                <span>7-day released trend</span>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#64748b]">Last 7 days</span>
            </div>
            <svg viewBox="0 0 100 100" className="h-24 w-full" aria-label="Revenue sparkline">
              <path d={sparklinePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Link to="/dashboard/settlements" className="inline-flex items-center gap-2 text-sm font-medium text-[#60a5fa] hover:text-white">
              View All Settlements <ArrowUpRight size={16} />
            </Link>
          </div>
        </>
      ) : null}
    </section>
  );
};

export default RevenueSummaryWidget;
