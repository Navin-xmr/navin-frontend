import { useCallback, useEffect, useState } from "react";
import { useNavigate, type SetURLSearchParams } from "react-router-dom";
import { notificationsApi, type Notification as NotificationType } from "@services/api/endpoints/notifications";
import { useRealtimeEvents } from "@hooks/useRealtimeEvents";
import type { UseBulkSelectionReturn } from "@hooks/useBulkSelection";
import { resolveNotificationLink } from "@utils/resolveNotificationLink";
import type { NotificationFilterType } from "../types";

const itemsPerPage = 20;

export interface UseNotificationsOptions {
  activeFilter: NotificationFilterType;
  searchQuery: string;
  setSearchParams: SetURLSearchParams;
  selection: Pick<UseBulkSelectionReturn, "isSelected" | "toggleOne">;
}

export function useNotifications({
  activeFilter,
  searchQuery,
  setSearchParams,
  selection,
}: UseNotificationsOptions) {
  const navigate = useNavigate();
  const { isSelected, toggleOne } = selection;
  const [notificationsList, setNotificationsList] = useState<
    NotificationType[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkAllLoading, setIsMarkAllLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const realtimeEvents = useRealtimeEvents(["notification:new"]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch {
        setError("Unable to load unread notification count.");
      }
    };

    void fetchUnreadCount();
  }, []);

  const fetchNotifications = useCallback(
    async (page: number, append = false) => {
      setError(null);
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = {
          page,
          limit: itemsPerPage,
          q: searchQuery.trim() || undefined,
          type: activeFilter !== "all" ? activeFilter : undefined,
        };

        const response = await notificationsApi.getAll(params);
        setNotificationsList((prev) =>
          append ? [...prev, ...response.data] : response.data,
        );
        setMeta(response.meta);
        setCurrentPage(response.meta.page);
      } catch {
        setError("Unable to load notifications. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeFilter, searchQuery],
  );

  useEffect(() => {
    Promise.resolve().then(() => {
      setCurrentPage(1);
      fetchNotifications(1, false);
      setSearchParams((prevParams) => {
        const nextParams = new URLSearchParams(prevParams);
        if (activeFilter !== "all") {
          nextParams.set("filter", activeFilter);
        } else {
          nextParams.delete("filter");
        }
        if (searchQuery.trim()) {
          nextParams.set("q", searchQuery.trim());
        } else {
          nextParams.delete("q");
        }
        return nextParams;
      });
    });
  }, [activeFilter, searchQuery, fetchNotifications, setSearchParams]);

  // Prepend new notification from realtime stream
  useEffect(() => {
    const event = realtimeEvents["notification:new"];
    if (!event) return;
    const n = event.notification;
    Promise.resolve().then(() => {
      setNotificationsList((prev) => {
        if (prev.some((x) => x.id === n.id)) return prev;
        const newItem: NotificationType = {
          id: n.id,
          type: "system",
          icon: "system",
          title: n.title,
          description: n.description,
          timestamp: n.timestamp,
          isRead: false,
        };
        return [newItem, ...prev];
      });
    });
  }, [realtimeEvents]);

  const handleLoadMore = async () => {
    if (!meta?.hasMore || isLoadingMore) return;
    await fetchNotifications(currentPage + 1, true);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkAllLoading(true);
    setError(null);

    try {
      await notificationsApi.markAllAsRead();
      setNotificationsList((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true })),
      );
      setUnreadCount(0);
    } catch {
      setError("Could not mark all notifications as read. Please try again.");
    } finally {
      setIsMarkAllLoading(false);
    }
  };

  const handleNotificationClick = async (id: string) => {
    const notification = notificationsList.find((item) => item.id === id);
    if (!notification) return;

    if (!notification.isRead) {
      try {
        await notificationsApi.markAsRead(id);
        setNotificationsList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isRead: true } : item,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        setError("Unable to mark notification as read. Please try again.");
      }
    }

    // #225: resolve the navigation path using _id (shipmentId) preferentially,
    // then trackingNumber, then the raw link — never hard-code trackingNumber-only paths.
    const destination = resolveNotificationLink({
      shipmentId: notification.shipmentId,
      trackingNumber: notification.trackingNumber,
      link: notification.link,
    });

    if (destination) {
      navigate(destination);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setError(null);
    try {
      await notificationsApi.deleteOne(id);
      setNotificationsList((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
      if (isSelected(id)) {
        toggleOne(id);
      }
    } catch {
      setError("Unable to delete notification. Please try again.");
    }
  };

  return {
    notificationsList,
    setNotificationsList,
    meta,
    isLoading,
    isLoadingMore,
    isMarkAllLoading,
    error,
    unreadCount,
    setUnreadCount,
    handleLoadMore,
    handleMarkAllAsRead,
    handleNotificationClick,
    handleDeleteNotification,
  };
}
