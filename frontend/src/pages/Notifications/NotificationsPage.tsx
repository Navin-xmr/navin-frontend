import {
  Bell, Settings, UserCircle, Check,
  Truck, FileText, AlertTriangle, Server, Receipt, DollarSign, Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import SearchInput from "../../components/ui/SearchInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notificationsApi, Notification as NotificationType } from "../../services/api/endpoints/notifications";
import { useRealtimeEvents } from "../../hooks/useRealtimeEvents";

type NotificationFilterType = "all" | "shipments" | "settlements" | "system";

const isValidFilter = (value: string | null): value is NotificationFilterType =>
  value === "all" || value === "shipments" || value === "settlements" || value === "system";

const iconStyles: Record<string, string> = {
  shipment: "bg-[rgba(37,99,235,0.1)] text-[#3b82f6]",
  contract: "bg-[rgba(5,150,105,0.1)] text-[#10b981]",
  alert:    "bg-[rgba(220,38,38,0.1)] text-[#ef4444]",
  system:   "bg-[rgba(107,114,128,0.1)] text-[#9ca3af]",
  invoice:  "bg-[rgba(107,114,128,0.1)] text-[#9ca3af]",
  payment:  "bg-[rgba(74,222,128,0.1)] text-[#4ade80]",
};

const itemsPerPage = 20;

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>(() => {
    const initialFilter = searchParams.get("filter");
    return isValidFilter(initialFilter) ? initialFilter : "all";
  });
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [notificationsList, setNotificationsList] = useState<NotificationType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number; hasMore: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkAllLoading, setIsMarkAllLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isGrouped, setIsGrouped] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("notificationsGrouped") === "true";
  });
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const realtimeEvents = useRealtimeEvents(['notification:new']);

  const groupedNotifications = useMemo(() => {
    const rawGroups = new Map<string, NotificationType[]>();
    const standalone: NotificationType[] = [];

    notificationsList.forEach((notification) => {
      if (notification.shipmentId) {
        const group = rawGroups.get(notification.shipmentId) ?? [];
        group.push(notification);
        rawGroups.set(notification.shipmentId, group);
      } else {
        standalone.push(notification);
      }
    });

    const shipmentGroups = Array.from(rawGroups.entries()).map(([shipmentId, notifications]) => {
      const sortedNotifications = [...notifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      const mostRecentNotification = sortedNotifications[0];
      const unreadCount = sortedNotifications.filter((item) => !item.isRead).length;

      return {
        shipmentId,
        trackingNumber: mostRecentNotification.trackingNumber,
        notifications: sortedNotifications,
        mostRecentNotification,
        unreadCount,
      };
    });

    const sortedGroups = shipmentGroups.sort(
      (a, b) =>
        new Date(b.mostRecentNotification.timestamp).getTime() -
        new Date(a.mostRecentNotification.timestamp).getTime(),
    );

    const sortedStandalone = [...standalone].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return { shipmentGroups: sortedGroups, standaloneNotifications: sortedStandalone };
  }, [notificationsList]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("notificationsGrouped", String(isGrouped));
  }, [isGrouped]);

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

  const toggleGroupExpansion = (shipmentId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(shipmentId) ? prev.filter((id) => id !== shipmentId) : [...prev, shipmentId],
    );
  };

  const fetchNotifications = useCallback(async (page: number, append = false) => {
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
      setNotificationsList((prev) => (append ? [...prev, ...response.data] : response.data));
      setMeta(response.meta);
      setCurrentPage(response.meta.page);
    } catch {
      setError("Unable to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
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
  }, [activeFilter, searchQuery, fetchNotifications, setSearchParams]);

  // Prepend new notification from realtime stream
  useEffect(() => {
    const event = realtimeEvents['notification:new'];
    if (!event) return;
    const n = event.notification;
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
  }, [realtimeEvents]);

  const handleFilterChange = (filter: NotificationFilterType) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
  };

  const handleLoadMore = async () => {
    if (!meta?.hasMore || isLoadingMore) return;
    await fetchNotifications(currentPage + 1, true);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkAllLoading(true);
    setError(null);

    try {
      await notificationsApi.markAllAsRead();
      setNotificationsList((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
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
        setNotificationsList((prev) => prev.map((item) => item.id === id ? { ...item, isRead: true } : item));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        setError("Unable to mark notification as read. Please try again.");
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setError(null);
    try {
      await notificationsApi.deleteOne(id);
      setNotificationsList((prev) => prev.filter((notification) => notification.id !== id));
    } catch {
      setError("Unable to delete notification. Please try again.");
    }
  };

  const filterCounts = useMemo(() => ({
    all: notificationsList.length,
    shipments: notificationsList.filter((notification) => notification.type === "shipments").length,
    settlements: notificationsList.filter((notification) => notification.type === "settlements").length,
    system: notificationsList.filter((notification) => notification.type === "system").length,
  }), [notificationsList]);

  const unreadNotifications = notificationsList.filter((notification) => !notification.isRead);
  const readNotifications = notificationsList.filter((notification) => notification.isRead);
  const currentUnreadCount = unreadNotifications.length || unreadCount;

  const filters: { key: NotificationFilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "shipments", label: "Shipments" },
    { key: "settlements", label: "Settlements" },
    { key: "system", label: "System" },
  ];

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "shipment": return <Truck size={20} />;
      case "contract": return <FileText size={20} />;
      case "alert":    return <AlertTriangle size={20} />;
      case "system":   return <Server size={20} />;
      case "invoice":  return <Receipt size={20} />;
      case "payment":  return <DollarSign size={20} />;
      default:         return <Bell size={20} />;
    }
  };

  const NotificationCard = ({ notification }: { notification: NotificationType }) => (
    <div
      className={`border rounded-xl p-5 flex gap-4 transition-all cursor-pointer ${
        notification.isRead
          ? "bg-[#1a1f28] border-[#374151]"
          : "bg-[#1f2937] border-[#374151] hover:bg-[#283039] hover:border-[#4b5563]"
      }`}
      onClick={() => handleNotificationClick(notification.id)}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative ${iconStyles[notification.icon]}`}>
        {getIconComponent(notification.icon)}
        {!notification.isRead && <div className="absolute top-1 right-1 w-2 h-2 bg-[#3b82f6] rounded-full" />}
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-base font-semibold ${notification.isRead ? "text-[#6b7280] font-medium" : "text-white font-bold"}`}>
            {notification.title}
          </span>
          {notification.badge && (
            <span
              className="px-2.5 py-1 rounded text-[11px] font-semibold tracking-[0.5px] text-white inline-flex items-center whitespace-nowrap leading-none"
              style={notification.isRead
                ? { backgroundColor: "transparent", border: `1px solid ${notification.badgeColor}`, color: notification.badgeColor }
                : { backgroundColor: notification.badgeColor, borderColor: notification.badgeColor }}
            >
              {notification.badge}
            </span>
          )}
        </div>
        <p className={`text-sm leading-[1.5] m-0 ${notification.isRead ? "text-[#6b7280]" : "text-[#9ca3af]"}`}>
          {notification.description}
        </p>
        <span className="text-xs text-[#6b7280]">{notification.timestamp}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!notification.isRead && (
          <button
            className="w-9 h-9 rounded-md bg-transparent border border-[#374151] flex items-center justify-center cursor-pointer transition-all text-[#6b7280] hover:bg-[#374151] hover:border-[#4b5563] hover:text-white"
            aria-label="Mark as read"
            onClick={(e) => { e.stopPropagation(); handleNotificationClick(notification.id); }}
          >
            <Check size={16} />
          </button>
        )}
        <button
          className="w-9 h-9 rounded-md bg-transparent border border-[#374151] flex items-center justify-center cursor-pointer transition-all text-[#6b7280] hover:bg-[#374151] hover:border-[#4b5563] hover:text-white"
          aria-label="Delete notification"
          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification.id); }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#101922] min-h-screen text-white">
      <div className="bg-[#111418] w-full border-b border-[#283039] px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/plan.svg" alt="Plan Icon" className="w-8 h-8" />
          <p className="text-lg font-semibold m-0 tracking-[0.5px]">NAVIN</p>
        </div>
        <div className="flex items-center gap-8">
          <nav className="flex gap-8">
            {["Dashboard", "Shipments", "Settlements", "Contracts", "Network"].map((item) => (
              <span key={item} className="cursor-pointer text-sm text-[#9ca3af] hover:text-white transition-colors">{item}</span>
            ))}
          </nav>
          <div className="flex gap-3">
            {[
              { icon: <Bell size={20} />, active: true, label: "Notifications" },
              { icon: <Settings size={20} />, label: "Settings" },
              { icon: <UserCircle size={20} />, label: "Profile" },
            ].map(({ icon, active, label }, i) => (
              <button key={i} aria-label={label} className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors border-none ${active ? "bg-[#2563eb] text-white" : "bg-[#1f2937] text-[#9ca3af] hover:bg-[#374151]"}`}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[32px] font-semibold m-0 mb-2">Notifications</h1>
            <p className="text-[#9ca3af] text-sm m-0">Stay updated with your supply chain events and settlements.</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-[#283039] border border-[#374151] rounded-lg text-white text-sm cursor-pointer transition-all hover:bg-[#1f2937] hover:border-[#4b5563] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleMarkAllAsRead}
            disabled={isMarkAllLoading || currentUnreadCount === 0}
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>

        <div className="flex justify-between items-center mb-8 gap-6 border-b border-[#283039] pb-5 flex-wrap">
          <div className="flex gap-2 flex-wrap items-center">
            {filters.map(({ key, label }) => (
              <button
                key={key}
                className={`px-4 py-2.5 border-none rounded-[20px] text-sm cursor-pointer transition-all flex items-center gap-2 ${
                  activeFilter === key ? "bg-[#2563eb] text-white" : "bg-transparent text-[#9ca3af] hover:bg-[#1f2937] hover:text-white"
                }`}
                onClick={() => handleFilterChange(key)}
              >
                {label}
                <span className="bg-[rgba(255,255,255,0.2)] px-2 py-0.5 rounded-xl text-xs font-semibold">
                  {filterCounts[key]}
                </span>
              </button>
            ))}
            <button
              type="button"
              className={`px-4 py-2.5 border-none rounded-[20px] text-sm cursor-pointer transition-all ${
                isGrouped ? "bg-[#2563eb] text-white" : "bg-transparent text-[#9ca3af] hover:bg-[#1f2937] hover:text-white"
              }`}
              onClick={() => setIsGrouped((prev) => !prev)}
            >
              {isGrouped ? "Grouped" : "Ungrouped"}
            </button>
          </div>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by ID, contract, or keyword..."
            isLoading={isLoading}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-[#7f1d1d] bg-[#1f1f22] px-5 py-4 text-sm text-[#fca5a5]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {isLoading && notificationsList.length === 0 ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border border-[#374151] rounded-xl p-5 animate-pulse bg-[#1b2430]">
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
            ))
          ) : notificationsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-[#6b7280]">
              <Bell size={48} className="mb-6 opacity-50" />
              <h3 className="text-xl font-semibold text-[#9ca3af] m-0 mb-2">No notifications found</h3>
              <p className="text-sm m-0">
                {searchQuery ? "Try adjusting your search terms" : "You're all caught up! No notifications in this category."}
              </p>
            </div>
          ) : isGrouped ? (
            <>
              {groupedNotifications.shipmentGroups.length > 0 && (
                <div className="space-y-4">
                  {groupedNotifications.shipmentGroups.map((group) => {
                    const expanded = expandedGroups.includes(group.shipmentId);
                    return (
                      <div key={group.shipmentId} className="border border-[#374151] rounded-2xl overflow-hidden bg-[#1f2937]">
                        <button
                          type="button"
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                          onClick={() => toggleGroupExpansion(group.shipmentId)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-base font-semibold text-white">
                                {group.trackingNumber || group.shipmentId}
                              </span>
                              <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-[#9ca3af]">
                                {group.notifications.length} updates
                              </span>
                              {group.unreadCount > 0 && (
                                <span className="rounded-full bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white">
                                  {group.unreadCount} unread
                                </span>
                              )}
                            </div>
                            <p className="mt-3 text-sm text-[#9ca3af] truncate">
                              {group.mostRecentNotification.title}
                            </p>
                            <span className="text-xs text-[#6b7280]">
                              {group.mostRecentNotification.timestamp}
                            </span>
                          </div>
                          <span className="text-sm text-[#9ca3af]">
                            {expanded ? "Collapse" : "Expand"}
                          </span>
                        </button>
                        {expanded && (
                          <div className="border-t border-[#283039] p-5 space-y-4">
                            {group.notifications.map((notification) => (
                              <NotificationCard key={notification.id} notification={notification} />
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
                  <div className="text-xs font-semibold text-[#6b7280] tracking-[0.5px] mt-6 mb-2">OTHER NOTIFICATIONS</div>
                  {groupedNotifications.standaloneNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              {unreadNotifications.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-[#6b7280] tracking-[0.5px] mt-4 mb-2">TODAY</div>
                  {unreadNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                </>
              )}
              {readNotifications.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-[#6b7280] tracking-[0.5px] mt-4 mb-2">EARLIER</div>
                  {readNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {!isLoading && meta?.hasMore && (
          <div className="flex flex-col items-center justify-center mt-8 gap-3">
            <button
              className="px-6 py-3 rounded-[18px] bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading more..." : "Load more notifications"}
            </button>
            <span className="text-xs text-[#9ca3af]">Showing {notificationsList.length} of {meta.total} notifications</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
