import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, LineChart } from 'lucide-react';
import { MOCK_TREND_DATA } from './mockTrendData';
import type { TimeRange, Granularity, TrendDataPoint } from './mockTrendData';

export interface ShipmentVolumeTrendWidgetProps {
  data?: Record<TimeRange, Record<Granularity, TrendDataPoint[]>>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2e] border border-border rounded-lg px-3.5 py-2.5">
      <div className="text-text-secondary text-[11px] font-semibold uppercase mb-2">
        {label}
      </div>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white text-sm font-semibold">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
];

const GRANULARITY_OPTIONS: Array<{ value: Granularity; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function calculatePercentageChange(
  data: TrendDataPoint[],
): { percentage: number; trend: 'up' | 'down' | 'neutral' } {
  if (data.length < 2) return { percentage: 0, trend: 'neutral' };

  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const firstAvg =
    firstHalf.reduce((sum, d) => sum + d.completed + d.cancelled, 0) /
    firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, d) => sum + d.completed + d.cancelled, 0) /
    secondHalf.length;

  if (firstAvg === 0) return { percentage: 0, trend: 'neutral' };

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  const isNeutral = Math.abs(change) < 0.5;

  return {
    percentage: Math.abs(change),
    trend: isNeutral ? 'neutral' : change > 0 ? 'up' : 'down',
  };
}

export default function ShipmentVolumeTrendWidget({
  data = MOCK_TREND_DATA,
}: ShipmentVolumeTrendWidgetProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [granularity, setGranularity] = useState<Granularity>('daily');

  const chartData = useMemo(
    () => data[timeRange][granularity],
    [data, timeRange, granularity],
  );

  const { percentage, trend } = useMemo(
    () => calculatePercentageChange(chartData),
    [chartData],
  );

  const trendColor =
    trend === 'up'
      ? 'text-accent-green'
      : trend === 'down'
        ? 'text-accent-red'
        : 'text-text-secondary';

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-background-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex justify-between items-start mb-4 md:flex-col md:gap-3">
          <div className="flex items-center gap-2.5">
            <LineChart size={18} className="text-accent-blue" />
            <h2 className="text-base font-bold">Shipment Volume Trend</h2>
            <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
              <TrendIcon size={14} />
              <span>{percentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as TimeRange)}
            aria-label="Time range"
            className="appearance-none bg-[#1a1f2e] border border-border text-text-primary text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer focus:outline-none focus:border-accent-blue"
          >
            {TIME_RANGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Granularity Toggle */}
        <div
          className="flex gap-1 bg-[#1a1f2e] rounded-lg p-[3px] w-fit"
          role="group"
          aria-label="Granularity"
        >
          {GRANULARITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`border-none text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                granularity === opt.value
                  ? 'bg-accent-blue text-white'
                  : 'bg-transparent text-text-secondary hover:text-white'
              }`}
              onClick={() => setGranularity(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="pt-5 pr-4 pb-3 pl-0 h-[400px] md:h-[300px] md:pt-4 md:pr-2 md:pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cancelledGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#1e2433" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#8a8f9d', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={
                granularity === 'daily'
                  ? timeRange === '7d'
                    ? 0
                    : timeRange === '30d'
                      ? 4
                      : 13
                  : granularity === 'weekly'
                    ? timeRange === '12m'
                      ? 7
                      : 2
                    : timeRange === '12m'
                      ? 1
                      : 0
              }
            />
            <YAxis
              tick={{ fill: '#8a8f9d', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '16px',
              }}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-text-secondary font-semibold ml-1">
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#completedGradient)"
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="cancelled"
              name="Cancelled"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#cancelledGradient)"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
