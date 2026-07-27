import type { Shipment } from '../api/shipmentApi';

export type RiskLevel = 'overdue' | 'at-risk' | 'normal';

export interface ShipmentRiskInfo {
  level: RiskLevel;
  label: string;
  daysOverdue?: number;
}

/**
 * Returns how many days have elapsed since `createdAt`.
 */
function daysSinceCreated(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

/**
 * Computes the risk level for a shipment:
 * - `overdue`  : IN_TRANSIT and older than 14 days (no delivery = late)
 * - `at-risk`  : IN_TRANSIT and 10–14 days old, OR URGENT and not DELIVERED/CANCELLED
 * - `normal`   : everything else
 */
export function getShipmentRiskLevel(shipment: Shipment): ShipmentRiskInfo {
  const { status, priority, createdAt } = shipment;
  const days = daysSinceCreated(createdAt);

  if (status === 'IN_TRANSIT' && days > 14) {
    return {
      level: 'overdue',
      label: 'Overdue',
      daysOverdue: days - 14,
    };
  }

  if (
    (status === 'IN_TRANSIT' && days >= 10 && days <= 14) ||
    (priority === 'URGENT' && status !== 'DELIVERED' && status !== 'CANCELLED')
  ) {
    return {
      level: 'at-risk',
      label: 'At Risk',
    };
  }

  return {
    level: 'normal',
    label: '',
  };
}

/**
 * Returns Tailwind class strings to highlight a table row or card
 * based on the shipment's risk level.
 */
export function getShipmentRiskStyle(level: RiskLevel): string {
  switch (level) {
    case 'overdue':
      // Red left border + subtle red background tint
      return 'border-l-4 border-l-red-500 bg-red-500/5';
    case 'at-risk':
      // Amber left border + subtle amber background tint
      return 'border-l-4 border-l-amber-400 bg-amber-400/5';
    default:
      return '';
  }
}
