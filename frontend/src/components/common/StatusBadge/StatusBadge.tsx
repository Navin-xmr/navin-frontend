import React from 'react';
import { getStatusVariant } from './statusBadgeVariants';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { bg, text } = getStatusVariant(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${bg} ${text} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
