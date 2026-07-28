import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../../Card/Card';

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
    <Card glow>
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 sm:mb-5 relative z-10">
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
          <div className="text-2xl sm:text-[32px] font-bold leading-none">
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
