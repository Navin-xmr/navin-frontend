import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../../Card/Card';

export interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  /** Makes the card a drill-down control (e.g. navigate to the filtered list). */
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendType, icon, onClick }) => {
  const trendColors = {
    up: 'text-accent-green',
    down: 'text-accent-red',
    neutral: 'text-accent-blue',
  };

  const card = (
    <Card glow hover={Boolean(onClick)}>
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

  if (!onClick) return card;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${value}. View details`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {card}
    </div>
  );
};

export default StatCard;
