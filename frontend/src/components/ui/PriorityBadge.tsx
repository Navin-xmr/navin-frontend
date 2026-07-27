import React from 'react';
import Tag, { TagVariant } from '../ui/Tag';

export interface PriorityBadgeProps {
  priority?: 'URGENT' | 'STANDARD' | 'ECONOMY';
  className?: string;
  onClick?: () => void;
}

const PRIORITY_VARIANT: Record<NonNullable<PriorityBadgeProps['priority']>, TagVariant> = {
  URGENT: 'danger',
  STANDARD: 'info',
  ECONOMY: 'neutral',
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '', onClick }) => {
  if (!priority) return null;

  const label = priority.charAt(0) + priority.slice(1).toLowerCase();

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Tag label={label} variant={PRIORITY_VARIANT[priority]} size="sm" dot className={className} />
    </span>
  );
};

export default PriorityBadge;
