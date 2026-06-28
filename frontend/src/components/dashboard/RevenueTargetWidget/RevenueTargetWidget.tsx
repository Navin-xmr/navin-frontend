import React from 'react';
import { Target } from 'lucide-react';
import { RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import {
  buildRevenueTargetData,
  type RevenueTargetData,
} from './mockRevenueTargetData';
import {
  buildSparklinePath,
  formatCurrency,
  getAchievementPercent,
  getGaugeColor,
  getProjectedEndOfMonthRevenue,
} from './revenueTargetUtils';

interface RevenueTargetWidgetProps {
  data?: RevenueTargetData;
}

const RevenueTargetWidget: React.FC<RevenueTargetWidgetProps> = ({
  data = buildRevenueTargetData(),
}) => {
  const achievementPercent = getAchievementPercent(data.actual, data.target);
  const gaugeColor = getGaugeColor(achievementPercent);
  const projectedRevenue = getProjectedEndOfMonthRevenue(data.actual);
  const sparklinePath = buildSparklinePath(data.dailyRevenue.map((entry) => entry.amount));

  const gaugeData = [
    {
      name: 'Achievement',
      value: Math.min(achievementPercent, 100),
      fill: gaugeColor,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#1e293b] bg-[#14171e] p-6 shadow-sm h-full">
      <div className="mb-4">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
          Monthly Target
        </p>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white m-0">
          <Target size={18} className="text-[#60a5fa]" />
          Revenue vs Target
        </h3>
      </div>

      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="100%"
            barSize={18}
            data={gaugeData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={12}
              background={{ fill: '#1e293b' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="m-0 text-2xl font-bold text-white">{formatCurrency(data.actual)}</p>
          <p className="m-0 mt-1 text-sm font-semibold" style={{ color: gaugeColor }}>
            {achievementPercent.toFixed(1)}% of target
          </p>
        </div>
      </div>

      <div className="mt-2 grid gap-2 text-sm text-[#cbd5e1]">
        <div className="flex items-center justify-between">
          <span className="text-[#94a3b8]">Actual</span>
          <span className="font-semibold text-white">{formatCurrency(data.actual)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#94a3b8]">Target</span>
          <span className="font-semibold text-white">{formatCurrency(data.target)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#94a3b8]">Projected EOM</span>
          <span className="font-semibold text-[#60a5fa]">{formatCurrency(projectedRevenue)}</span>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#1e293b] bg-[#0f172a] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-[#cbd5e1]">Daily revenue</span>
          <span className="text-xs uppercase tracking-[0.2em] text-[#64748b]">This month</span>
        </div>
        <svg viewBox="0 0 100 100" className="h-20 w-full" aria-label="Daily revenue sparkline">
          <path
            d={sparklinePath}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
};

export default RevenueTargetWidget;
