import type { Notification } from "@services/api/endpoints/notifications";

export type NotificationFilterType = "all" | "shipments" | "settlements" | "system";
export type ReadStateFilter = "all" | "unread" | "read";
export type SortMode = "newest" | "oldest" | "unreadFirst";
export type NotificationDensity = "comfortable" | "compact";

export interface ShipmentNotificationGroup {
  shipmentId: string;
  trackingNumber?: string;
  notifications: Notification[];
  mostRecentNotification: Notification;
  unreadCount: number;
}

export interface GroupedNotifications {
  shipmentGroups: ShipmentNotificationGroup[];
  standaloneNotifications: Notification[];
}
