import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts';
import type { TelemetryRecord, TimeRange } from './hooks/useTelemetry';

interface Props {
  records: TelemetryRecord[];
  timeRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const RANGES: TimeRange[] = ['6h', '24h', '7d'];

interface ChartPoint {
  time: string;
  temperature: number;
  humidity: number;
  isAnomaly: boolean;
}

function toChartData(records: TelemetryRecord[]): ChartPoint[] {
  return records.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    humidity: r.humidity,
    isAnomaly: r.isAnomaly,
  }));
}

const AnomalyDot = (props: { cx?: number; cy?: number; payload?: ChartPoint }) => {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload?.isAnomaly) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
};

const TemperatureHumidityChart: React.FC<Props> = ({ records, timeRange, onRangeChange }) => {
  const data = toChartData(records);

  return (
    <div className="flex flex-col gap-3">
      {/* Time range toggle */}
      <div className="flex items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              timeRange === r
                ? 'bg-primary text-white'
                : 'bg-background-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-8">No historical data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              stroke="rgba(255,255,255,0.2)"
            />
            {/* Left Y-axis: temperature */}
            <YAxis
              yAxisId="temp"
              orientation="left"
              tick={{ fontSize: 11 }}
              label={{ value: '°C', position: 'insideLeft', offset: 10, fontSize: 11 }}
              stroke="rgba(255,255,255,0.2)"
            />
            {/* Right Y-axis: humidity */}
            <YAxis
              yAxisId="hum"
              orientation="right"
              tick={{ fontSize: 11 }}
              label={{ value: '%', position: 'insideRight', offset: -10, fontSize: 11 }}
              stroke="rgba(255,255,255,0.2)"
            />
            <Tooltip
              contentStyle={{ fontSize: 12, background: '#1a2035', border: '1px solid #2d3748' }}
            />
            {/* Temperature breach band */}
            <ReferenceLine yAxisId="temp" y={30} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
            <ReferenceLine yAxisId="temp" y={2} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />

            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#f97316"
              strokeWidth={2}
              dot={<Dot r={0} />}
              activeDot={{ r: 4 }}
              name="Temp (°C)"
            />
            <Line
              yAxisId="hum"
              type="monotone"
              dataKey="humidity"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={<AnomalyDot />}
              activeDot={{ r: 4 }}
              name="Humidity (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TemperatureHumidityChart;
