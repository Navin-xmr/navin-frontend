import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { MOCK_VOLUME_DATA } from './mockVolumeData';
import type { DailyVolume } from './mockVolumeData';
import './ShipmentVolumeChart.css';

type Range = 7 | 30 | 90;

interface ShipmentVolumeChartProps {
  data?: DailyVolume[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="volume-tooltip">
      <div className="volume-tooltip-label">{label}</div>
      <div className="volume-tooltip-value">
        {payload[0].value} shipments
      </div>
    </div>
  );
}

export default function ShipmentVolumeChart({ data = MOCK_VOLUME_DATA }: ShipmentVolumeChartProps) {
  const [activeRange, setActiveRange] = useState<Range>(30);

  const chartData = data.slice(-activeRange);

  const ranges: { value: Range; label: string }[] = [
    { value: 7, label: '7D' },
    { value: 30, label: '30D' },
    { value: 90, label: '90D' },
  ];

  return (
    <div className="volume-chart-section">
      <div className="volume-chart-header">
        <h2 className="volume-chart-title">
          <BarChart3 size={18} />
          Shipment Volume
        </h2>
        <div className="range-toggle" role="group" aria-label="Time range">
          {ranges.map(r => (
            <button
              key={r.value}
              type="button"
              className={activeRange === r.value ? 'active' : ''}
              onClick={() => setActiveRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="volume-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="#1e2433"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: '#8a8f9d', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={activeRange <= 7 ? 0 : activeRange <= 30 ? 4 : 13}
            />
            <YAxis
              tick={{ fill: '#8a8f9d', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
            />
            <Bar
              dataKey="count"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={activeRange <= 7 ? 48 : 24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
