import { useCallback, useMemo } from "react";
import type { Notification as NotificationType } from "@services/api/endpoints/notifications";
import type { GroupedNotifications, ReadStateFilter, SortMode } from "../types";

export interface UseNotificationViewOptions {
  notificationsList: NotificationType[];
  readStateFilter: ReadStateFilter;
  sortMode: SortMode;
  unreadCount: number;
  isSelected: (id: string) => boolean;
}

export function useNotificationView({
  notificationsList,
  readStateFilter,
  sortMode,
  unreadCount,
  isSelected,
}: UseNotificationViewOptions) {
  // Sort notifications based on selected sort mode
  const sortNotifications = useCallback(
    (list: NotificationType[]): NotificationType[] => {
      const sorted = [...list];
      if (sortMode === "unreadFirst") {
        sorted.sort((a, b) => {
          if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      } else if (sortMode === "oldest") {
        sorted.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      } else {
        // newest first (default)
        sorted.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
      }
      return sorted;
    },
    [sortMode],
  );

  const readStateFilteredNotifications = useMemo(() => {
    if (readStateFilter === "unread") {
      return notificationsList.filter((notification) => !notification.isRead);
    }
    if (readStateFilter === "read") {
      return notificationsList.filter((notification) => notification.isRead);
    }
    return notificationsList;
  }, [notificationsList, readStateFilter]);

  const groupedNotifications = useMemo<GroupedNotifications>(() => {
    const rawGroups = new Map<string, NotificationType[]>();
    const standalone: NotificationType[] = [];

    readStateFilteredNotifications.forEach((notification) => {
      if (notification.shipmentId) {
        const group = rawGroups.get(notification.shipmentId) ?? [];
        group.push(notification);
        rawGroups.set(notification.shipmentId, group);
      } else {
        standalone.push(notification);
      }
    });

    const shipmentGroups = Array.from(rawGroups.entries()).map(
      ([shipmentId, notifications]) => {
        const sortedNotifications = [...notifications].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        const mostRecentNotification = sortedNotifications[0];
        const groupUnreadCount = sortedNotifications.filter(
          (item) => !item.isRead,
        ).length;

        return {
          shipmentId,
          trackingNumber: mostRecentNotification.trackingNumber,
          notifications: sortedNotifications,
          mostRecentNotification,
          unreadCount: groupUnreadCount,
        };
      },
    );

    const sortedGroups = shipmentGroups.sort(
      (a, b) =>
        new Date(b.mostRecentNotification.timestamp).getTime() -
        new Date(a.mostRecentNotification.timestamp).getTime(),
    );

    const sortedStandalone = [...standalone].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return {
      shipmentGroups: sortedGroups,
      standaloneNotifications: sortedStandalone,
    };
  }, [readStateFilteredNotifications]);

  const visibleIds = useMemo(
    () => readStateFilteredNotifications.map((notification) => notification.id),
    [readStateFilteredNotifications],
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => isSelected(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => isSelected(id));

  const filterCounts = useMemo(
    () => ({
      all: notificationsList.length,
      shipments: notificationsList.filter(
        (notification) => notification.type === "shipments",
      ).length,
      settlements: notificationsList.filter(
        (notification) => notification.type === "settlements",
      ).length,
      system: notificationsList.filter(
        (notification) => notification.type === "system",
      ).length,
    }),
    [notificationsList],
  );

  const readStateCounts = useMemo(
    () => ({
      all: notificationsList.length,
      unread: notificationsList.filter((notification) => !notification.isRead)
        .length,
      read: notificationsList.filter((notification) => notification.isRead)
        .length,
    }),
    [notificationsList],
  );

  const unreadNotifications = readStateFilteredNotifications.filter(
    (notification) => !notification.isRead,
  );
  const readNotifications = readStateFilteredNotifications.filter(
    (notification) => notification.isRead,
  );

  const sortedUnreadNotifications = useMemo(
    () => sortNotifications(unreadNotifications),
    [unreadNotifications, sortNotifications],
  );

  const sortedReadNotifications = useMemo(
    () => sortNotifications(readNotifications),
    [readNotifications, sortNotifications],
  );

  const currentUnreadCount =
    notificationsList.filter((notification) => !notification.isRead).length ||
    unreadCount;

  return {
    readStateFilteredNotifications,
    groupedNotifications,
    visibleIds,
    allVisibleSelected,
    someVisibleSelected,
    filterCounts,
    readStateCounts,
    sortedUnreadNotifications,
    sortedReadNotifications,
    currentUnreadCount,
  };
}
