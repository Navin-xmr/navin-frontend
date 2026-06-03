import React from 'react';
import './StatusBadge.css';

export type ShipmentStatus = 
  | 'In Transit'
  | 'Delivered'
  | 'Pending Approval'
  | 'Cancelled'
  | 'Picked Up'
  | 'At Checkpoint'
  | 'Out for Delivery';

export interface StatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const getStatusClassName = (status: ShipmentStatus): string => {
    switch (status) {
      case 'In Transit':
      case 'Picked Up':
      case 'At Checkpoint':
      case 'Out for Delivery':
        return 'status-in-transit';
      case 'Delivered':
        return 'status-delivered';
      case 'Pending Approval':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-in-transit';
    }
  };

  return (
    <span 
      className={`status-badge ${getStatusClassName(status)} ${className}`}
      aria-label={`Shipment status: ${status}`}
    >
      {status}
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