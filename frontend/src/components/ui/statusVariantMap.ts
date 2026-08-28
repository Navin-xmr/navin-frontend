import type { TagVariant } from './Tag';

// Status variant mapping for common statuses
export const STATUS_VARIANT_MAP: Record<string, TagVariant> = {
  active: 'success',
  completed: 'success',
  delivered: 'success',
  released: 'success',
  success: 'success',
  pending: 'warning',
  in_transit: 'info',
  processing: 'info',
  escrowed: 'accent',
  failed: 'danger',
  cancelled: 'danger',
  disputed: 'danger',
  error: 'danger',
  idle: 'neutral',
  draft: 'neutral',
};
