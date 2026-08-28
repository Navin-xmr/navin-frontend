import React from 'react';
import type { RiskLevel } from '../../../utils/shipmentRisk';

export interface OverdueShipmentBadgeProps {
  level: RiskLevel;
  daysOverdue?: number;
}

const STYLES: Record<Exclude<RiskLevel, 'normal'>, string> = {
  overdue:
    'bg-red-500/15 text-red-400 border border-red-500/30',
  'at-risk':
    'bg-amber-400/15 text-amber-400 border border-amber-400/30',
};

const LABELS: Record<Exclude<RiskLevel, 'normal'>, string> = {
  overdue: 'Overdue',
  'at-risk': 'At Risk',
};

/**
 * A small badge that visually flags overdue or at-risk shipments.
 * Returns null for shipments with `normal` risk level.
 */
const OverdueShipmentBadge: React.FC<OverdueShipmentBadgeProps> = ({
  level,
  daysOverdue,
}) => {
  if (level === 'normal') return null;

  const label =
    level === 'overdue' && daysOverdue !== undefined && daysOverdue > 0
      ? `Overdue by ${daysOverdue}d`
      : LABELS[level];

  const ariaLabel =
    level === 'overdue' && daysOverdue !== undefined && daysOverdue > 0
      ? `Shipment is overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`
      : level === 'overdue'
        ? 'Shipment is overdue'
        : 'Shipment is at risk of being late';

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${STYLES[level]}`}
    >
      {label}
    </span>
  );
};

export default OverdueShipmentBadge;
