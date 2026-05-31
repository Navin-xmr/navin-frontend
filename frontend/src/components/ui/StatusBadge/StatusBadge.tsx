import React from 'react';
export interface StatusBadgeProps {
  status: string;
  className?: string;
}

import { getStatusDisplayLabel, getStatusBadgeClass } from '../../../utils/shipmentStatus';

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = ''
}) => {
  // Use shared mapping for display and classes
  const label = getStatusDisplayLabel(status);
  const classes = getStatusBadgeClass(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${classes} ${className}`}
      aria-label={`Shipment status: ${label}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;