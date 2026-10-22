import type { DeliveryOutcome } from '@components/dashboard/Charts/DeliverySuccessChart/types';

/** Test-only delivery outcome breakdown. Production code must never fall back to this. */
export const DELIVERY_OUTCOMES_FIXTURE: DeliveryOutcome[] = [
  { status: 'Delivered', count: 956, color: '#10b981' },
  { status: 'In Transit', count: 442, color: '#3b82f6' },
  { status: 'Delayed', count: 52, color: '#f59e0b' },
  { status: 'Failed', count: 9, color: '#ef4444' },
];
