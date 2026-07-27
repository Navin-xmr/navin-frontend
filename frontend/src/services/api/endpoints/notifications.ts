import { apiClient } from "../client";

// ---------- Notification Preferences ----------

export type NotificationChannel = "email" | "sms";

export type NotificationEventType =
  | "shipment_created"
  | "status_changed"
  | "delivery_confirmed"
  | "payment_received"
  | "dispute_opened"
  | "dispute_resolved";

export interface NotificationPreference {
  event: NotificationEventType;
  email: boolean;
  sms: boolean;
}

export type PreferencesMap = Record<NotificationEventType, { email: boolean; sms: boolean }>;

export const notificationPreferencesApi = {
  getPreferences: async (): Promise<PreferencesMap> => {
    const res = await apiClient.get<{ data: NotificationPreference[] }>("/notifications/preferences");
    return Object.fromEntries(res.data.data.map((p) => [p.event, { email: p.email, sms: p.sms }])) as PreferencesMap;
  },

  updatePreference: async (event: NotificationEventType, channel: NotificationChannel, enabled: boolean): Promise<void> => {
    await apiClient.patch("/notifications/preferences", { event, channel, enabled });
  },

  sendOtp: async (phone: string): Promise<void> => {
    await apiClient.post("/notifications/phone/send-otp", { phone });
  },

  verifyOtp: async (phone: string, otp: string): Promise<void> => {
    await apiClient.post("/notifications/phone/verify-otp", { phone, otp });
  },
};

// ---------- Notifications ----------

export type NotificationType = "all" | "shipments" | "settlements" | "system";
export type NotificationIcon = "shipment" | "contract" | "alert" | "system" | "invoice" | "payment";

export interface Notification {
  id: string;
  type: Exclude<NotificationType, "all">;
  icon: NotificationIcon;
  title: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  timestamp: string;
  shipmentId?: string;
  trackingNumber?: string;
  actionLabel?: string;
  isRead: boolean;
  link?: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: Exclude<NotificationType, "all">;
  q?: string;
}

export const notificationsApi = {
  getAll: async (params?: GetNotificationsParams): Promise<PaginatedNotifications> => {
    const res = await apiClient.get<{ data: Notification[]; meta: PaginatedNotifications["meta"] }>(
      "/notifications",
      { params },
    );
    return { data: res.data.data, meta: res.data.meta };
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post("/notifications/read-all");
  },

  deleteOne: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<{ data: { unreadCount: number } }>("/notifications/unread-count");
    return res.data.data.unreadCount;
  },
};
