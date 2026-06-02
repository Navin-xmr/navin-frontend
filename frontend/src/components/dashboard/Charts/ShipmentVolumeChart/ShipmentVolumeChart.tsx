import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { MOCK_VOLUME_DATA } from './mockVolumeData';
import type { DailyVolume } from './mockVolumeData';

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
    <div className="bg-[#1a1f2e] border border-border rounded-lg px-3.5 py-2.5">
      <div className="text-text-secondary text-[11px] font-semibold uppercase mb-1">{label}</div>
      <div className="text-white text-sm font-bold">{payload[0].value} shipments</div>
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
    <div className="p-0">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex justify-between items-center md:flex-col md:gap-3 md:items-start">
        <h2 className="text-base font-bold flex items-center gap-2.5">
          <BarChart3 size={18} className="text-accent-blue" />
          Shipment Volume
        </h2>
        <div
          className="flex gap-1 bg-[#1a1f2e] rounded-lg p-[3px]"
          role="group"
          aria-label="Time range"
        >
          {ranges.map(r => (
            <button
              key={r.value}
              type="button"
              className={`border-none text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                activeRange === r.value
                  ? 'bg-accent-blue text-white'
                  : 'bg-transparent text-text-secondary hover:text-white'
              }`}
              onClick={() => setActiveRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="pt-5 pr-4 pb-3 pl-0 h-[300px] md:h-[220px] md:pt-4 md:pr-2 md:pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#1e2433" strokeDasharray="3 3" />
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={activeRange <= 7 ? 48 : 24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
