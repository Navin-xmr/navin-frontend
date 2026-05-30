import React from 'react';
import { getStatusDisplayLabel, getStatusBadgeClass } from '../../../utils/shipmentStatus';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const label = getStatusDisplayLabel(status);
  const classes = getStatusBadgeClass(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${classes} ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
