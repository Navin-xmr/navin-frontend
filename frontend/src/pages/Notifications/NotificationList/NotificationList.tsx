import { BellOff } from "lucide-react";
import EmptyState from "@components/common/EmptyState/EmptyState";
import type { Notification as NotificationType } from "@services/api/endpoints/notifications";
import NotificationCard from "../NotificationCard";
import type { NotificationCardActions } from "../NotificationCard";
import type { GroupedNotifications, NotificationDensity, ReadStateFilter } from "../types";

export interface NotificationListProps {
  isLoading: boolean;
  notificationsCount: number;
  readStateFilteredNotifications: NotificationType[];
  searchQuery: string;
  readStateFilter: ReadStateFilter;
  isGrouped: boolean;
  groupedNotifications: GroupedNotifications;
  expandedGroups: string[];
  toggleGroupExpansion: (shipmentId: string) => void;
  notifDensity: NotificationDensity;
  sortedUnreadNotifications: NotificationType[];
  sortedReadNotifications: NotificationType[];
  cardActions: NotificationCardActions;
}

const NotificationList = ({
  isLoading,
  notificationsCount,
  readStateFilteredNotifications,
  searchQuery,
  readStateFilter,
  isGrouped,
  groupedNotifications,
  expandedGroups,
  toggleGroupExpansion,
  notifDensity,
  sortedUnreadNotifications,
  sortedReadNotifications,
  cardActions,
}: NotificationListProps) => (
  <div className={`flex flex-col ${notifDensity === "compact" ? "gap-1.5" : "gap-4"}`}>
    {isLoading && notificationsCount === 0 ? (
      <>{Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`notification-skeleton-${index}`}
          className="border border-[#374151] rounded-xl p-5 animate-pulse bg-[#1b2430]"
        >
          <div className="flex gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#283039]" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 rounded-lg bg-[#283039] w-3/4" />
              <div className="h-4 rounded-lg bg-[#283039] w-full" />
              <div className="h-4 rounded-lg bg-[#283039] w-5/6" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <div className="h-9 w-20 rounded-md bg-[#283039]" />
            <div className="h-9 w-9 rounded-md bg-[#283039]" />
          </div>
        </div>
      ))}</>
    ) : readStateFilteredNotifications.length === 0 ? (
      <EmptyState
        icon={<BellOff size={28} />}
        title="No notifications found"
        description={
          searchQuery
            ? "Try adjusting your search terms"
            : readStateFilter === "unread"
              ? "You're all caught up! No unread notifications."
              : readStateFilter === "read"
                ? "No read notifications yet."
                : "You're all caught up! No notifications in this category."
        }
      />
    ) : isGrouped ? (
      <>
        {groupedNotifications.shipmentGroups.length > 0 && (
          <div className="space-y-4">
            {groupedNotifications.shipmentGroups.map((group) => {
              const expanded = expandedGroups.includes(group.shipmentId);
              return (
                <div
                  key={group.shipmentId}
                  className="border border-[#374151] rounded-2xl overflow-hidden bg-[#1f2937]"
                >
                  <button
                    type="button"
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-accent-blue focus-visible:outline-offset-[-2px]"
                    onClick={() => toggleGroupExpansion(group.shipmentId)}
                    aria-expanded={expanded}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-base font-semibold text-white">
                          {group.trackingNumber || group.shipmentId}
                        </span>
                        <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-text-secondary">
                          {group.notifications.length} updates
                        </span>
                        {group.unreadCount > 0 && (
                          <span className="rounded-full bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white">
                            {group.unreadCount} unread
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-text-secondary truncate">
                        {group.mostRecentNotification.title}
                      </p>
                      <span className="text-xs text-[#6b7280]">
                        {group.mostRecentNotification.timestamp}
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {expanded ? "Collapse" : "Expand"}
                    </span>
                  </button>
                  {expanded && (
                    <div className="border-t border-[#283039] p-5 space-y-4">
                      {group.notifications.map((notification) => (
                        <NotificationCard
                          {...cardActions}
                          key={notification.id}
                          notification={notification}
                          compact={notifDensity === "compact"}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {groupedNotifications.standaloneNotifications.length > 0 && (
          <>
            <div className="text-xs font-semibold text-[#6b7280] tracking-[0.5px] mt-6 mb-2">
              OTHER NOTIFICATIONS
            </div>
            {groupedNotifications.standaloneNotifications.map(
              (notification) => (
                <NotificationCard
                  {...cardActions}
                  key={notification.id}
                  notification={notification}
                  compact={notifDensity === "compact"}
                />
              ),
            )}
          </>
        )}
      </>
    ) : (
      <>
        {sortedUnreadNotifications.length > 0 && (
          <>
            <div className="text-xs font-semibold text-[#6b7280] tracking-[0.5px] mt-4 mb-2">
              TODAY
            </div>
            {sortedUnreadNotifications.map((notification) => (
              <NotificationCard
                {...cardActions}
                key={notification.id}
                notification={notification}
                compact={notifDensity === "compact"}
              />
            ))}
          </>
        )}
        {sortedReadNotifications.length > 0 && (
          <>
            <div className="text-xs font-semibold text-[#6b7280] tracking-[0.5px] mt-4 mb-2">
              EARLIER
            </div>
            {sortedReadNotifications.map((notification) => (
              <NotificationCard
                {...cardActions}
                key={notification.id}
                notification={notification}
                compact={notifDensity === "compact"}
              />
            ))}
          </>
        )}
      </>
    )}
  </div>
);

export default NotificationList;
