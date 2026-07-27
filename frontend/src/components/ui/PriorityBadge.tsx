import React from 'react';

export interface PriorityBadgeProps {
  priority?: 'URGENT' | 'STANDARD' | 'ECONOMY';
  className?: string;
  onClick?: () => void;
}

const PRIORITY_CLASSES: Record<NonNullable<PriorityBadgeProps['priority']>, string> = {
  URGENT: 'bg-red-500/15 text-red-400 border border-red-500/30',
  STANDARD: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  ECONOMY: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '', onClick }) => {
  if (!priority) return null;

  const label = priority.charAt(0) + priority.slice(1).toLowerCase();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${PRIORITY_CLASSES[priority]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {label}
    </span>
  );
};

export default PriorityBadge;
