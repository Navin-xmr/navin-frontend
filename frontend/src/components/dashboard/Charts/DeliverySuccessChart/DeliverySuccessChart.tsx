import { memo, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { MOCK_DELIVERY_DATA, calculateSuccessRate } from './mockDeliveryData';
import type { DeliveryOutcome } from './mockDeliveryData';
import { ChartLoading } from '../../../ui/ChartLoading';
import { ChartError } from '../../../ui/ChartError';
import RichChartTooltip, { ViewDetailsAction } from '../../../ui/RichChartTooltip';

interface DeliverySuccessChartProps {
  data?: DeliveryOutcome[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name?: string; value?: number; payload?: { color?: string } }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const value = item.value ?? 0;
  const color = item.payload?.color;

  const handleViewDetails = useCallback(() => {
    console.info(`View details for: ${item.name}`);
  }, [item.name]);

  return (
    <RichChartTooltip
      active={active}
      title={item.name}
      items={[
        {
          label: 'Shipments',
          value,
          unit: 'shipments',
          color,
        },
      ]}
      actions={[ViewDetailsAction(handleViewDetails)]}
    />
  );
}

function DeliverySuccessChart({ data = MOCK_DELIVERY_DATA, loading, error, onRetry }: DeliverySuccessChartProps) {
  const successRate = useMemo(() => calculateSuccessRate(data), [data]);
  const total = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data]);

  if (loading) {
    return <ChartLoading rows={4} height={480} label="Loading delivery success chart…" />;
  }

  if (error) {
    return <ChartError message={error} onRetry={onRetry} height={480} />;
  }

  return (
    <div className="p-0">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-base font-bold flex items-center gap-2.5">
          <TrendingUp size={18} className="text-accent-green" />
          Delivery Success Rates
        </h2>
      </div>

      {/* Chart body */}
      <div className="px-6 pt-8 pb-6 h-[280px] md:h-[240px] md:px-4 md:pt-6 md:pb-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="count"
              nameKey="status"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-[32px] md:text-[28px] font-bold text-white leading-none">{successRate}%</div>
          <div className="text-xs font-semibold text-text-secondary uppercase mt-1">Success</div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-6 md:px-4 md:pb-4 flex flex-col gap-3">
        {data.map(item => (
          <div key={item.status} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-[3px] shrink-0" style={{ backgroundColor: item.color }} />
            <div className="flex justify-between items-center flex-1">
              <span className="text-[13px] text-text-secondary font-medium">{item.status}</span>
              <span className="text-sm text-white font-semibold">{item.count}</span>
            </div>
        ))}
        <div className="flex justify-between items-center pt-3 mt-1 border-t border-border">
          <span className="text-[13px] text-text-secondary font-semibold uppercase">Total</span>
          <span className="text-base text-white font-bold">{total}</span>
        </div>
    </div>
  );
}

export default memo(DeliverySuccessChart);
