import type { NotificationChannel, NotificationEventType } from '@services/api/endpoints/notifications';

export type ExtendedChannel = NotificationChannel | 'push';

export interface ExtendedPreference {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export type ExtendedPreferencesMap = Record<NotificationEventType, ExtendedPreference>;

export interface EventDef {
  event: NotificationEventType;
  label: string;
}

export interface CategoryDef {
  label: string;
  events: EventDef[];
}
