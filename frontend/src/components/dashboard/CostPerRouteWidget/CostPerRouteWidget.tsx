import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Table2 } from 'lucide-react';
import RouteShipmentsModal from './RouteShipmentsModal';
import {
  MOCK_ROUTE_COST_DATA,
  type RouteCostData,
} from './mockCostPerRouteData';
import {
  COST_SEGMENTS,
  formatCurrency,
  getMarginColorClass,
  getRouteMarginPercent,
  getRouteTotalCost,
  toChartRow,
} from './costPerRouteUtils';

type ViewMode = 'chart' | 'table';

interface CostPerRouteWidgetProps {
  data?: RouteCostData[];
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
}

interface RouteTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function RouteTooltip({ active, payload, label }: RouteTooltipProps) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, item) => sum + (item.value ?? 0), 0);

  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#1a1f2e] px-3.5 py-2.5">
      <div className="mb-2 text-[11px] font-semibold uppercase text-[#94a3b8]">{label}</div>
      <div className="space-y-1 text-sm">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-[#cbd5e1]">{item.name}</span>
            <span className="font-semibold text-white">{formatCurrency(item.value ?? 0)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-[#334155] pt-2 text-sm font-semibold text-white">
        Total cost: {formatCurrency(total)}
      </div>
    </div>
  );
}

const CostPerRouteWidget: React.FC<CostPerRouteWidgetProps> = ({
  data = MOCK_ROUTE_COST_DATA,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [selectedRoute, setSelectedRoute] = useState<RouteCostData | null>(null);

  const sortedRoutes = useMemo(
    () =>
      [...data].sort((a, b) => getRouteTotalCost(b) - getRouteTotalCost(a)),
    [data],
  );

  const topRoutes = useMemo(() => sortedRoutes.slice(0, 10), [sortedRoutes]);
  const chartData = useMemo(() => topRoutes.map(toChartRow), [topRoutes]);

  const openRoute = (routeName: string) => {
    const route = data.find((entry) => entry.route === routeName) ?? null;
    setSelectedRoute(route);
  };

  return (
    <section className="rounded-2xl border border-[#1e293b] bg-[#14171e] p-6 shadow-sm h-full">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
            Route Analytics
          </p>
          <h3 className="m-0 flex items-center gap-2 text-lg font-semibold text-white">
            <BarChart3 size={18} className="text-[#60a5fa]" />
            Cost per Route
          </h3>
        </div>

        <div
          className="flex rounded-full border border-[#1e293b] bg-[#0f172a] p-1"
          role="group"
          aria-label="Route analytics view mode"
        >
          <button
            type="button"
            aria-pressed={viewMode === 'chart'}
            onClick={() => setViewMode('chart')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'chart' ? 'bg-[#2563eb] text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            Chart
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'table'}
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'table' ? 'bg-[#2563eb] text-white' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Table2 size={14} />
            Table
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <>
          <div className="mb-3 flex flex-wrap gap-3">
            {COST_SEGMENTS.map((segment) => (
              <div key={segment.key} className="flex items-center gap-2 text-xs text-[#94a3b8]">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                {segment.label}
              </div>
            ))}
          </div>

          <div className="h-[360px] max-md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
              >
                <CartesianGrid horizontal={false} stroke="#1e2433" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tick={{ fill: '#8a8f9d', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="route"
                  width={150}
                  tick={{ fill: '#8a8f9d', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<RouteTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} />
                {COST_SEGMENTS.map((segment) => (
                  <Bar
                    key={segment.key}
                    dataKey={segment.key}
                    name={segment.label}
                    stackId="cost"
                    fill={segment.color}
                    radius={segment.key === 'insurance' ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={(barData: any) => openRoute(String(barData.route || barData.payload?.route))}
                    className="cursor-pointer"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1e293b]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#0f172a] text-left text-[#94a3b8]">
              <tr>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {sortedRoutes.map((route) => {
                const margin = getRouteMarginPercent(route);
                return (
                  <tr
                    key={route.route}
                    className="cursor-pointer border-t border-[#1e293b] text-[#cbd5e1] transition-colors hover:bg-[#0f172a]"
                    onClick={() => setSelectedRoute(route)}
                  >
                    <td className="px-4 py-3">{route.route}</td>
                    <td className="px-4 py-3">{formatCurrency(getRouteTotalCost(route))}</td>
                    <td className="px-4 py-3">{formatCurrency(route.revenue)}</td>
                    <td className={`px-4 py-3 font-semibold ${getMarginColorClass(margin)}`}>
                      {margin.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <RouteShipmentsModal route={selectedRoute} onClose={() => setSelectedRoute(null)} />
    </section>
  );
};

export default CostPerRouteWidget;
