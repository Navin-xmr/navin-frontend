import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertTriangle,
  Target,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { MOCK_KPI_DATA, getOnTimeStatusColor } from './mockPerformanceData';
import type { KpiSummary, TimePeriod, KpiKey } from './mockPerformanceData';

export interface DeliveryPerformanceWidgetProps {
  data?: Record<TimePeriod, KpiSummary[]>;
}

interface DetailTooltipProps {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}

function DetailTooltip({ active, payload, label }: DetailTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2e] border border-border rounded-lg px-3.5 py-2.5">
      <div className="text-text-secondary text-[11px] font-semibold uppercase mb-1">{label}</div>
      <div className="text-white text-sm font-bold">{payload[0].value}</div>
    </div>
  );
}

const PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
];

const KPI_META: Record<KpiKey, { icon: typeof Clock; accent: string }> = {
  onTimeRate: { icon: CheckCircle2, accent: 'text-accent-green' },
  avgDeliveryTime: { icon: Clock, accent: 'text-accent-blue' },
  exceptionRate: { icon: AlertTriangle, accent: 'text-accent-red' },
  firstAttemptRate: { icon: Target, accent: 'text-accent-teal' },
};

function formatValue(value: number, unit: string): string {
  if (unit === '%') return `${value.toFixed(1)}%`;
  return `${value.toFixed(1)} ${unit}`;
}

function getTrendInfo(current: number, previous: number, unit: string) {
  const delta = current - previous;
  const isNeutral = Math.abs(delta) < 0.05;
  const lowerIsBetter = unit === 'days' || (unit === '%' && current < 50);
  let trendType: 'up' | 'down' | 'neutral';
  if (isNeutral) trendType = 'neutral';
  else trendType = delta > 0 ? 'up' : 'down';

  const positive = isNeutral ? null : lowerIsBetter ? delta < 0 : delta > 0;
  const pct = previous !== 0 ? Math.abs((delta / previous) * 100).toFixed(1) : '0.0';
  return { delta, trendType, positive, pct };
}

interface SparklineProps {
  data: { value: number }[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function DeliveryPerformanceWidget({
  data = MOCK_KPI_DATA,
}: DeliveryPerformanceWidgetProps) {
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [expandedKey, setExpandedKey] = useState<KpiKey | null>(null);

  const kpis = useMemo(() => data[period], [data, period]);
  const expanded = useMemo(
    () => kpis.find(k => k.key === expandedKey) ?? null,
    [kpis, expandedKey],
  );

  const handleCardClick = (key: KpiKey) => {
    setExpandedKey(prev => (prev === key ? null : key));
  };

  return (
    <div className="bg-background-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex justify-between items-center md:flex-col md:gap-3 md:items-start">
        <h2 className="text-base font-bold flex items-center gap-2.5">
          <TrendingUp size={18} className="text-accent-blue" />
          Delivery Performance
        </h2>
        <div className="relative">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as TimePeriod)}
            aria-label="Time period"
            className="appearance-none bg-[#1a1f2e] border border-border text-text-primary text-xs font-semibold pl-3 pr-8 py-1.5 rounded-md cursor-pointer focus:outline-none focus:border-accent-blue"
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
        </div>
      </div>

      {/* KPI cards grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const meta = KPI_META[kpi.key];
          const Icon = meta.icon;
          const trend = getTrendInfo(kpi.current, kpi.previous, kpi.unit);
          const isExpanded = expandedKey === kpi.key;

          let statusRing = '';
          let sparkColor = '#3B82F6';
          if (kpi.key === 'onTimeRate') {
            const status = getOnTimeStatusColor(kpi.current);
            if (status === 'green') {
              statusRing = 'ring-1 ring-accent-green/40';
              sparkColor = '#10B981';
            } else if (status === 'yellow') {
              statusRing = 'ring-1 ring-yellow-500/40';
              sparkColor = '#F59E0B';
            } else {
              statusRing = 'ring-1 ring-accent-red/40';
              sparkColor = '#EF4444';
            }
          }

          const trendColor = trend.positive
            ? 'text-accent-green'
            : trend.positive === false
              ? 'text-accent-red'
              : 'text-text-secondary';

          const TrendIcon =
            trend.trendType === 'up'
              ? TrendingUp
              : trend.trendType === 'down'
                ? TrendingDown
                : Minus;

          const cardClasses = [
            'text-left bg-background-elevated border border-border rounded-xl p-4 cursor-pointer transition-all hover:border-accent-blue/50 focus:outline-none focus:border-accent-blue',
            statusRing,
            isExpanded ? 'border-accent-blue/60' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={kpi.key}
              type="button"
              onClick={() => handleCardClick(kpi.key)}
              aria-expanded={isExpanded}
              className={cardClasses}
            >
              {/* Header row */}
              <div className="flex justify-between items-start mb-3">
                <div className={`w-9 h-9 rounded-[9px] bg-background-card flex items-center justify-center ${meta.accent}`}>
                  <Icon size={18} />
                </div>
                <div className={`text-xs font-semibold flex items-center gap-1 ${trendColor}`}>
                  <TrendIcon size={14} />
                  {trend.pct}%
                </div>
              </div>

              {/* Label + value */}
              <div className="text-text-secondary text-[11px] font-semibold uppercase mb-1.5 leading-tight">
                {kpi.label}
              </div>
              <div className="text-2xl font-bold leading-none mb-3">
                {formatValue(kpi.current, kpi.unit)}
              </div>

              {/* Sparkline */}
              <div className="h-10 w-full">
                <Sparkline data={kpi.trend} color={sparkColor} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-5 pb-5 animate-fade-in-up">
          <div className="bg-background-elevated border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold">{expanded.label} — 30-Day Trend</h3>
              <span className="text-xs text-text-secondary">
                Current: {formatValue(expanded.current, expanded.unit)} · Previous:{' '}
                {formatValue(expanded.previous, expanded.unit)}
              </span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={expanded.trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${expanded.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#1e2433" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#8a8f9d', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: '#8a8f9d', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<DetailTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill={`url(#grad-${expanded.key})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
