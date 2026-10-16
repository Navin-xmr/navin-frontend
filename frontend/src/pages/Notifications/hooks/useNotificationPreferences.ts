import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { NotificationFilterType, ReadStateFilter, SortMode } from "../types";

const isValidFilter = (value: string | null): value is NotificationFilterType =>
  value === "all" ||
  value === "shipments" ||
  value === "settlements" ||
  value === "system";

const isValidReadState = (value: string | null): value is ReadStateFilter =>
  value === "all" || value === "unread" || value === "read";

export function useNotificationPreferences() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>(
    () => {
      const initialFilter = searchParams.get("filter");
      return isValidFilter(initialFilter) ? initialFilter : "all";
    },
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || "",
  );
  const [readStateFilter, setReadStateFilter] = useState<ReadStateFilter>(
    () => {
      const initialReadState = searchParams.get("read");
      return isValidReadState(initialReadState) ? initialReadState : "all";
    },
  );
  const [isGrouped, setIsGrouped] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("notificationsGrouped") === "true";
  });
  const [notifDensity, setNotifDensity] = useState<"comfortable" | "compact">(() => {
    if (typeof window === "undefined") return "comfortable";
    return window.localStorage.getItem("notificationsDensity") === "compact"
      ? "compact"
      : "comfortable";
  });
  const handleNotifDensityChange = (d: "comfortable" | "compact") => {
    setNotifDensity(d);
    try { window.localStorage.setItem("notificationsDensity", d); } catch { /* ignore */ }
  };
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("notificationsGrouped", String(isGrouped));
  }, [isGrouped]);

  const toggleGroupExpansion = (shipmentId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(shipmentId)
        ? prev.filter((id) => id !== shipmentId)
        : [...prev, shipmentId],
    );
  };

  // Sync read-state filter to the URL without re-fetching (it's applied client-side).
  useEffect(() => {
    setSearchParams((prevParams) => {
      const nextParams = new URLSearchParams(prevParams);
      if (readStateFilter !== "all") {
        nextParams.set("read", readStateFilter);
      } else {
        nextParams.delete("read");
      }
      return nextParams;
    });
  }, [readStateFilter, setSearchParams]);

  const handleFilterChange = (filter: NotificationFilterType) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
  };

  return {
    activeFilter,
    handleFilterChange,
    searchQuery,
    setSearchQuery,
    readStateFilter,
    setReadStateFilter,
    setSearchParams,
    isGrouped,
    setIsGrouped,
    notifDensity,
    handleNotifDensityChange,
    expandedGroups,
    toggleGroupExpansion,
    sortMode,
    setSortMode,
  };
}
