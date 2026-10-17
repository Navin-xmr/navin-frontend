import { useState, type Dispatch, type SetStateAction } from "react";
import { notificationsApi, type Notification as NotificationType } from "@services/api/endpoints/notifications";
import { useToast } from "@context/ToastContext";
import type { UseBulkSelectionReturn } from "@hooks/useBulkSelection";

export interface UseNotificationBulkActionsOptions {
  notificationsList: NotificationType[];
  setNotificationsList: Dispatch<SetStateAction<NotificationType[]>>;
  setUnreadCount: Dispatch<SetStateAction<number>>;
  selection: UseBulkSelectionReturn;
}

export function useNotificationBulkActions({
  notificationsList,
  setNotificationsList,
  setUnreadCount,
  selection,
}: UseNotificationBulkActionsOptions) {
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const { addToast } = useToast();

  const { selectedIds, isSelected, toggleOne, clearSelection } = selection;

  const handleBulkMarkAsRead = async () => {
    const ids = [...selectedIds].filter((id) => {
      const notification = notificationsList.find((item) => item.id === id);
      return notification && !notification.isRead;
    });
    if (ids.length === 0) {
      clearSelection();
      return;
    }

    setIsBulkProcessing(true);
    try {
      const { succeeded, failed } = await notificationsApi.markManyAsRead(ids);
      const succeededIds = succeeded;
      const failedCount = failed.length;

      if (succeededIds.length > 0) {
        setNotificationsList((prev) =>
          prev.map((notification) =>
            succeededIds.includes(notification.id)
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - succeededIds.length));
      }

      if (failedCount === 0) {
        addToast(
          `Marked ${succeededIds.length} notification${succeededIds.length === 1 ? "" : "s"} as read.`,
          "success",
        );
        clearSelection();
      } else if (succeededIds.length > 0) {
        addToast(
          `Marked ${succeededIds.length} as read, ${failedCount} failed. Please try again.`,
          "warning",
        );
        succeededIds.forEach((id) => {
          if (isSelected(id)) toggleOne(id);
        });
      } else {
        addToast("Unable to mark notifications as read. Please try again.", "error");
      }
    } catch {
      addToast("Unable to mark notifications as read. Please try again.", "error");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const ids = [...selectedIds];
    setIsBulkProcessing(true);
    try {
      const { succeeded, failed } = await notificationsApi.deleteMany(ids);
      const succeededIds = succeeded;
      const failedCount = failed.length;

      if (succeededIds.length > 0) {
        setNotificationsList((prev) =>
          prev.filter((notification) => !succeededIds.includes(notification.id)),
        );
      }

      if (failedCount === 0) {
        addToast(
          `Deleted ${succeededIds.length} notification${succeededIds.length === 1 ? "" : "s"}.`,
          "success",
        );
        clearSelection();
      } else if (succeededIds.length > 0) {
        addToast(
          `Deleted ${succeededIds.length}, ${failedCount} failed. Please try again.`,
          "warning",
        );
        succeededIds.forEach((id) => {
          if (isSelected(id)) toggleOne(id);
        });
      } else {
        addToast("Unable to delete notifications. Please try again.", "error");
      }
    } catch {
      addToast("Unable to delete notifications. Please try again.", "error");
    } finally {
      setIsBulkProcessing(false);
      setIsBulkDeleteOpen(false);
    }
  };

  return {
    isBulkDeleteOpen,
    setIsBulkDeleteOpen,
    isBulkProcessing,
    handleBulkMarkAsRead,
    handleBulkDeleteConfirm,
  };
}
