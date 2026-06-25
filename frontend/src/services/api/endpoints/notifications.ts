import { apiClient } from "../client";

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
