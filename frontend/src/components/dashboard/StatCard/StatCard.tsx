import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendType, icon }) => {
  const trendColors = {
    up: 'text-accent-green',
    down: 'text-accent-red',
    neutral: 'text-accent-blue',
  };

  return (
    <div className="relative bg-background-card border border-border rounded-2xl p-5 overflow-hidden after:absolute after:top-0 after:right-0 after:w-24 after:h-24 after:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] after:pointer-events-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="w-10 h-10 rounded-[10px] bg-background-elevated flex items-center justify-center text-accent-blue">
          {icon}
        </div>
        <div className={`text-xs font-semibold flex items-center gap-1 ${trendColors[trendType]}`}>
          {trendType === 'up' && <ArrowUpRight size={14} />}
          {trendType === 'down' && <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-text-secondary text-xs font-semibold uppercase mb-2">
          {label}
        </div>
        <div className="text-[32px] font-bold leading-none">
          {value}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
