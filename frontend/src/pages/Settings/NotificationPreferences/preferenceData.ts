import type { NotificationEventType } from '@services/api/endpoints/notifications';
import type { CategoryDef, ExtendedPreferencesMap } from './types';

export const CATEGORIES: CategoryDef[] = [
  {
    label: 'Shipments',
    events: [
      { event: 'shipment_created', label: 'Shipment Created' },
      { event: 'status_changed', label: 'Status Changed' },
      { event: 'delivery_confirmed', label: 'Delivery Confirmed' },
    ],
  },
  {
    label: 'Payments',
    events: [{ event: 'payment_received', label: 'Payment Received' }],
  },
  {
    label: 'Disputes',
    events: [
      { event: 'dispute_opened', label: 'Dispute Opened' },
      { event: 'dispute_resolved', label: 'Dispute Resolved' },
    ],
  },
];

export const ALL_EVENTS: NotificationEventType[] = CATEGORIES.flatMap((c) => c.events.map((e) => e.event));

export const defaultPreferences = (): ExtendedPreferencesMap =>
  Object.fromEntries(
    ALL_EVENTS.map((e) => [e, { email: false, sms: false, push: false }]),
  ) as ExtendedPreferencesMap;
