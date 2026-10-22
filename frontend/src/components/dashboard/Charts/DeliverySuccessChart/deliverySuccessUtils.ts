import type { DeliveryOutcome } from './types';

/**
 * Calculate overall success rate (Delivered / Total)
 */
export function calculateSuccessRate(data: DeliveryOutcome[]): number {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const delivered = data.find(item => item.status === 'Delivered')?.count || 0;
  return total > 0 ? Math.round((delivered / total) * 100) : 0;
}
