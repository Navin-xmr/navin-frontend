import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlignJustify,
  LayoutGrid,
  List,
  Map,
  Package,
  SearchX,
  ArrowUpDown,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { shipmentApi, type Shipment } from "../../api/shipmentApi";
import type { ShipmentPriority } from "../../api/shipmentApi";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/shipment/PriorityBadge/PriorityBadge";
import { BulkActionBar } from "../../components/shipment/BulkActionBar";
import { BulkStatusModal } from "../../components/shipment/BulkStatusModal";
import { useBulkSelection } from "../../hooks/useBulkSelection";
import { useToast } from "../../context/ToastContext";
import { safeFormatDate } from "../../utils/safeFormat";
import ExportDropdown from "../../components/ui/ExportDropdown";
import type { ExportFormat } from "../../components/ui/ExportDropdown";
import {
  getShipmentRiskLevel,
  getShipmentRiskStyle,
} from "../../utils/shipmentRisk";
import OverdueShipmentBadge from "../../components/shipment/OverdueShipmentBadge/OverdueShipmentBadge";
import { useVirtualShipments } from "./hooks/useVirtualShipments";
import ShipmentsKanban from "./KanbanView/ShipmentsKanban";
import RouteMap from "./RouteMap/RouteMap";
import ShipmentFilters, {
  type ShipmentFiltersValues,
  type ShipmentStatus,
  type Priority,
} from "./ShipmentFilters";
import "./Shipments.css";

type ListMode = "table" | "grid";
type ListDensity = "comfortable" | "compact";

const LIST_MODE_KEY = "shipments-list-mode";
const DENSITY_KEY = "shipments-density";

function exportShipmentsToCSV(shipments: Shipment[], filename?: string): void {
  const headers = [
    "Tracking Number",
    "Origin",
    "Destination",
    "Status",
    "Created At",
    "Expected Delivery",
    "Carrier",
  ];
  const rows = shipments.map((s) => [
    s.id,
    s.origin,
    s.destination,
    s.status,
    safeFormatDate(s.createdAt),
    "N/A",
    "N/A",
  ]);

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ].join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? `navin-shipments-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 50;
const SCROLL_KEY = "shipments-scroll-index";
const VIEW_KEY = "shipments-view";

type ShipmentsView = "list" | "kanban" | "routeMap";

// ─── URL param helpers ────────────────────────────────────────────────────────

type TopStatusFilter = "ALL" | "CREATED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
type TopPriorityFilter = "ALL" | ShipmentPriority;
type TopTimeframeFilter = "ALL" | "30" | "90";
type TopSortOrder = "asc" | "desc";

const STATUS_VALUES: TopStatusFilter[] = ["ALL", "CREATED", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
const PRIORITY_VALUES: TopPriorityFilter[] = ["ALL", "URGENT", "STANDARD", "ECONOMY"];

function readStatusParam(sp: URLSearchParams): TopStatusFilter {
  const v = sp.get("status") as TopStatusFilter | null;
  return v && STATUS_VALUES.includes(v) ? v : "ALL";
}

function readPriorityParam(sp: URLSearchParams): TopPriorityFilter {
  const v = sp.get("priority") as TopPriorityFilter | null;
  return v && PRIORITY_VALUES.includes(v) ? v : "ALL";
}

function readTimeframeParam(sp: URLSearchParams): TopTimeframeFilter {
  const v = sp.get("timeframe");
  return v === "30" || v === "90" ? v : "ALL";
}

function readSortParam(sp: URLSearchParams): TopSortOrder {
  return sp.get("sort") === "asc" ? "asc" : "desc";
}

// ─── Component ────────────────────────────────────────────────────────────────

const Shipments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const loadingRef = useRef(false);

  const {
    selectedIds,
    isSelected,
    toggleOne,
    toggleAll,
    clearSelection,
    selectedCount,
  } = useBulkSelection();

  const [view, setView] = useState<ShipmentsView>(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "kanban" || saved === "routeMap") return saved;
      return "list";
    } catch {
      return "list";
    }
  });

  const handleViewChange = (next: ShipmentsView) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // ignore persistence failures
    }
  };

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<TopStatusFilter>(
    () => readStatusParam(searchParams),
  );
  const [timeframeFilter, setTimeframeFilter] = useState<TopTimeframeFilter>(
    () => readTimeframeParam(searchParams),
  );
  const [listMode, setListMode] = useState<ListMode>(() => {
    try {
      const saved = localStorage.getItem(LIST_MODE_KEY);
      return saved === "grid" ? "grid" : "table";
    } catch {
      return "table";
    }
  });
  const handleListModeChange = (mode: ListMode) => {
    setListMode(mode);
    try {
      localStorage.setItem(LIST_MODE_KEY, mode);
    } catch {
      // ignore
    }
  };
  const [listDensity, setListDensity] = useState<ListDensity>(() => {
    try {
      const saved = localStorage.getItem(DENSITY_KEY);
      return saved === "compact" ? "compact" : "comfortable";
    } catch {
      return "comfortable";
    }
  });
  const handleDensityChange = (density: ListDensity) => {
    setListDensity(density);
    try {
      localStorage.setItem(DENSITY_KEY, density);
    } catch {
      // ignore
    }
  };
  const [priorityFilter, setPriorityFilter] = useState<TopPriorityFilter>(
    () => readPriorityParam(searchParams),
  );
  const [sortOrder, setSortOrder] = useState<TopSortOrder>(
    () => readSortParam(searchParams),
  );
  const [advancedFilters, setAdvancedFilters] = useState<ShipmentFiltersValues>(
    {
      status: [],
      dateFrom: "",
      dateTo: "",
      carrier: "",
      origin: "",
      destination: "",
      weightMin: "",
      weightMax: "",
      priority: [],
    },
  );
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [savedFilters, setSavedFilters] = useState<
    {
      name: string;
      filters: {
        search: string;
        status: string;
        priority: string;
        timeframe: string;
      };
    }[]
  >(() => {
    try {
      const raw = localStorage.getItem("navin_saved_filters");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const hasMore = shipments.length < total;

  // ─── Sync top-level filters → URL (replace so back-button skips intermediates)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncFiltersToURL = useCallback(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          // search
          if (searchQuery.trim()) next.set("q", searchQuery.trim());
          else next.delete("q");
          // status
          if (statusFilter !== "ALL") next.set("status", statusFilter);
          else next.delete("status");
          // priority
          if (priorityFilter !== "ALL") next.set("priority", priorityFilter);
          else next.delete("priority");
          // timeframe
          if (timeframeFilter !== "ALL") next.set("timeframe", timeframeFilter);
          else next.delete("timeframe");
          // sort — only write when non-default
          if (sortOrder !== "desc") next.set("sort", sortOrder);
          else next.delete("sort");
          return next;
        },
        { replace: true },
      );
    }, 200);
  }, [searchQuery, statusFilter, priorityFilter, timeframeFilter, sortOrder, setSearchParams]);

  useEffect(() => {
    syncFiltersToURL();
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [syncFiltersToURL]);

  const filteredShipments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = shipments;

    if (q) {
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q),
      );
    }

    // Wire dropdown status filter into the logic
    if (statusFilter !== "ALL") {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Wire dropdown priority filter
    if (priorityFilter !== "ALL") {
      result = result.filter((s) => s.priority === priorityFilter);
    }

    // Wire timeframe filter
    if (timeframeFilter !== "ALL") {
      const daysAgo = parseInt(timeframeFilter, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysAgo);
      result = result.filter((s) => new Date(s.createdAt) >= cutoff);
    }

    const { status, dateFrom, dateTo, origin, destination, priority } =
      advancedFilters;

    if (status.length > 0) {
      result = result.filter((s) => status.includes(s.status));
    } else if (statusFilter !== "ALL") {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((s) => new Date(s.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((s) => new Date(s.createdAt) <= to);
    }

    if (priority.length > 0) {
      result = result.filter(
        (s) => s.priority && priority.includes(s.priority),
      );
    } else if (priorityFilter !== "ALL") {
      result = result.filter((s) => s.priority === priorityFilter);
    }

    if (origin) {
      const o = origin.toLowerCase();
      result = result.filter((s) => s.origin.toLowerCase().includes(o));
    }

    if (destination) {
      const d = destination.toLowerCase();
      result = result.filter((s) => s.destination.toLowerCase().includes(d));
    }

    // Apply date sorting
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [shipments, searchQuery, statusFilter, priorityFilter, timeframeFilter, advancedFilters, sortOrder]);

  const visibleIds = useMemo(
    () => filteredShipments.map((s) => s.id),
    [filteredShipments],
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => isSelected(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => isSelected(id));

  const handleSaveFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;
    const name = newFilterName.trim();

    if (savedFilters.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      alert("A filter with this name already exists.");
      return;
    }

    const savedStatus =
      advancedFilters.status.length === 1 ? advancedFilters.status[0] : "ALL";
    const savedPriority =
      advancedFilters.priority.length === 1
        ? advancedFilters.priority[0]
        : "ALL";

    const newFilter = {
      name,
      filters: {
        search: searchQuery,
        status: savedStatus,
        priority: savedPriority,
        timeframe: "ALL",
      },
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem("navin_saved_filters", JSON.stringify(updated));
    setNewFilterName("");
    setIsSavingFilter(false);
  };

  const handleApplyFilter = (saved: {
    search: string;
    status: string;
    priority: string;
    timeframe: string;
  }) => {
    setSearchQuery(saved.search || "");
    setAdvancedFilters({
      status: saved.status !== "ALL" ? [saved.status as ShipmentStatus] : [],
      dateFrom: "",
      dateTo: "",
      carrier: "",
      origin: "",
      destination: "",
      weightMin: "",
      weightMax: "",
      priority: saved.priority !== "ALL" ? [saved.priority as Priority] : [],
    });
  };

  const handleDeleteFilter = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedFilters.filter((f) => f.name !== name);
    setSavedFilters(updated);
    localStorage.setItem("navin_saved_filters", JSON.stringify(updated));
  };

  const { parentRef, virtualizer, handleScroll, scrollToIndex } =
    useVirtualShipments({
      shipments: filteredShipments,
      onLoadMore: () => setCurrentPage((p) => p + 1),
      hasMore,
    });

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    shipmentApi
      .getAll({ limit: PAGE_SIZE, page: currentPage })
      .then((response) => {
        setShipments((prev) =>
          currentPage === 1 ? response.data : [...prev, ...response.data],
        );
        setTotal(response.meta.total);
      })
      .catch((err: Error) => {
        setError(err.message || "Unable to load shipments.");
      })
      .finally(() => {
        setIsLoading(false);
        loadingRef.current = false;
      });
  }, [currentPage, retryKey]);

  // Restore scroll position on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const idx = parseInt(saved, 10);
      if (!isNaN(idx) && idx > 0) {
        requestAnimationFrame(() => scrollToIndex(idx));
      }
    }
    return () => {
      sessionStorage.removeItem(SCROLL_KEY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowClick = (shipmentId: string, index: number) => {
    sessionStorage.setItem(SCROLL_KEY, String(index));
    navigate(`/dashboard/shipments/${shipmentId}`);
  };

  const exportShipmentsToJSON = (shipmentsList: Shipment[], filename?: string): void => {
    const today = new Date().toISOString().slice(0, 10);
    const json = JSON.stringify(shipmentsList, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename ?? `navin-shipments-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printShipments = (shipmentsList: Shipment[]): void => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = shipmentsList
      .map(
        (s) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd">${s.id}</td>
            <td style="padding:8px;border:1px solid #ddd">${s.origin}</td>
            <td style="padding:8px;border:1px solid #ddd">${s.destination}</td>
            <td style="padding:8px;border:1px solid #ddd">${s.status}</td>
            <td style="padding:8px;border:1px solid #ddd">${safeFormatDate(s.createdAt)}</td>
          </tr>`,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Navin Shipments - ${today}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
        h1 { color: #00d4c8; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f5f5f5; padding: 10px 8px; text-align: left; border: 1px solid #ddd; }
        @media print { button { display: none; } }
      </style></head>
      <body>
        <h1>NAVIN Shipments Report</h1>
        <p>${today} — ${shipmentsList.length} shipments</p>
        <button onclick="window.print()" style="padding:8px 16px;background:#00d4c8;color:#fff;border:none;border-radius:6px;cursor:pointer;margin-bottom:16px;">Print / Save as PDF</button>
        <table>
          <thead><tr>
            <th style="padding:10px 8px;border:1px solid #ddd">Tracking Number</th>
            <th style="padding:10px 8px;border:1px solid #ddd">Origin</th>
            <th style="padding:10px 8px;border:1px solid #ddd">Destination</th>
            <th style="padding:10px 8px;border:1px solid #ddd">Status</th>
            <th style="padding:10px 8px;border:1px solid #ddd">Created</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:20px;font-size:11px;color:#999">Generated by Navin — Blockchain-Verified Logistics</p>
      </body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const handleExport = async (format: ExportFormat): Promise<void> => {
    switch (format) {
      case "csv":
        exportShipmentsToCSV(shipments);
        break;
      case "json":
        exportShipmentsToJSON(shipments);
        break;
      case "print":
        printShipments(shipments);
        break;
    }
  };

  const handleExportSelected = (format: ExportFormat): void => {
    const selectedShipments = shipments.filter((s) => isSelected(s.id));
    if (selectedShipments.length === 0) return;

    const prefix = `navin-selected-shipments-${new Date().toISOString().slice(0, 10)}`;

    switch (format) {
      case "csv":
        exportShipmentsToCSV(selectedShipments, `${prefix}.csv`);
        break;
      case "json":
        exportShipmentsToJSON(selectedShipments, `${prefix}.json`);
        break;
      case "print":
        printShipments(selectedShipments);
        break;
    }
  };

  const handleBulkStatusConfirm = async (newStatus: ShipmentStatus) => {
    if (selectedIds.size === 0) return;

    // Optimistically update UI
    const prevShipments = shipments;
    setShipments((prev) =>
      prev.map((s) =>
        selectedIds.has(s.id) ? ({ ...s, status: newStatus } as Shipment) : s,
      ),
    );
    clearSelection();
    setIsBulkModalOpen(false);

    // Apply optimistic update with rollback on failure
    setIsBulkUpdating(true);
    try {
      await shipmentApi.bulkUpdateStatus(Array.from(selectedIds), newStatus);
      addToast("Status updated successfully", "success");
    } catch {
      // Rollback on failure
      setShipments(prevShipments);
      addToast("Failed to update status", "error");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleRetry = () => {
    loadingRef.current = false;
    setShipments([]);
    setTotal(0);
    setCurrentPage(1);
    setRetryKey((value) => value + 1);
  };

  const isAnyFilterActive =
    searchQuery !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    timeframeFilter !== "ALL" ||
    advancedFilters.status.length > 0 ||
    advancedFilters.dateFrom !== "" ||
    advancedFilters.dateTo !== "" ||
    advancedFilters.carrier !== "" ||
    advancedFilters.origin !== "" ||
    advancedFilters.destination !== "" ||
    advancedFilters.weightMin !== "" ||
    advancedFilters.weightMax !== "" ||
    advancedFilters.priority.length > 0;
  const isEmpty = !isLoading && !error && shipments.length === 0;
  const isFilterEmpty =
    !isLoading &&
    !error &&
    shipments.length > 0 &&
    filteredShipments.length === 0;
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className="shipments-page">
      <div className="shipments-header">
        <h1>Shipments</h1>
        <div className="flex items-center gap-3">
          {/* List / Grid sub-toggle (only visible in list view) */}
          {view === "list" && (
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center rounded-lg border border-[rgba(98,255,255,0.15)] bg-[rgba(19,186,186,0.04)] p-0.5"
                role="group"
                aria-label="Toggle list or grid layout"
              >
                <button
                  type="button"
                  onClick={() => handleListModeChange("table")}
                  aria-pressed={listMode === "table"}
                  title="Table view"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    listMode === "table"
                      ? "bg-[#62ffff] text-black"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <List size={14} />
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => handleListModeChange("grid")}
                  aria-pressed={listMode === "grid"}
                  title="Grid view"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    listMode === "grid"
                      ? "bg-[#62ffff] text-black"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <LayoutGrid size={14} />
                  Grid
                </button>
              </div>

              {/* Density toggle — only meaningful in table mode */}
              {listMode === "table" && (
                <div
                  className="inline-flex items-center rounded-lg border border-[rgba(98,255,255,0.15)] bg-[rgba(19,186,186,0.04)] p-0.5"
                  role="group"
                  aria-label="Toggle row density"
                >
                  <button
                    type="button"
                    onClick={() => handleDensityChange("comfortable")}
                    aria-pressed={listDensity === "comfortable"}
                    title="Comfortable density"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      listDensity === "comfortable"
                        ? "bg-[#62ffff] text-black"
                        : "text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    <AlignJustify size={14} />
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDensityChange("compact")}
                    aria-pressed={listDensity === "compact"}
                    title="Compact density"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      listDensity === "compact"
                        ? "bg-[#62ffff] text-black"
                        : "text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    <List size={14} />
                    Compact
                  </button>
                </div>
              )}
            </div>
          )}

          {/* View toggle */}
          <div
            className="inline-flex items-center rounded-lg border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] p-0.5"
            role="group"
            aria-label="Toggle shipments view"
          >
            <button
              type="button"
              onClick={() => handleViewChange("list")}
              aria-pressed={view === "list"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                view === "list"
                  ? "bg-[#62ffff] text-black"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              <List size={14} />
              List
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("kanban")}
              aria-pressed={view === "kanban"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                view === "kanban"
                  ? "bg-[#62ffff] text-black"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("routeMap")}
              aria-pressed={view === "routeMap"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                view === "routeMap"
                  ? "bg-[#62ffff] text-black"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              <Map size={14} />
              Map
            </button>
          </div>

          <ExportDropdown
            onExport={handleExport}
            disabled={shipments.length === 0}
            label="Export"
          />
        </div>
      </div>

      {view === "kanban" ? (
        <ShipmentsKanban />
      ) : view === "routeMap" ? (
        <RouteMap />
      ) : (
        <>
          {/* Saved filter chips */}
          {savedFilters.length > 0 && (
            <div
              className="flex flex-wrap gap-2 mb-4"
              aria-label="Saved filters"
            >
              {savedFilters.map((sf) => (
                <button
                  key={sf.name}
                  type="button"
                  onClick={() => handleApplyFilter(sf.filters)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[rgba(98,255,255,0.06)] hover:bg-[rgba(98,255,255,0.12)] border border-[rgba(98,255,255,0.2)] hover:border-[rgba(98,255,255,0.4)] rounded-full text-xs text-[#62ffff] font-medium transition-all cursor-pointer"
                >
                  <span>{sf.name}</span>
                  <span
                    onClick={(e) => handleDeleteFilter(sf.name, e)}
                    className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.15)] text-[#62ffff] font-bold text-xs"
                    role="button"
                    aria-label={`Delete ${sf.name} filter`}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
            <div className="flex-1 min-w-[280px]">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by ID, origin, or destination..."
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as TopStatusFilter,
                )
              }
              className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] cursor-pointer"
              aria-label="Filter by Status"
            >
              <option value="ALL" className="bg-[#121620]">
                All Statuses
              </option>
              <option value="CREATED" className="bg-[#121620]">
                Created
              </option>
              <option value="IN_TRANSIT" className="bg-[#121620]">
                In Transit
              </option>
              <option value="DELIVERED" className="bg-[#121620]">
                Delivered
              </option>
              <option value="CANCELLED" className="bg-[#121620]">
                Cancelled
              </option>
            </select>

            {/* Timeframe Filter */}
            <select
              value={timeframeFilter}
              onChange={(e) =>
                setTimeframeFilter(e.target.value as TopTimeframeFilter)
              }
              className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] cursor-pointer"
              aria-label="Filter by Timeframe"
            >
              <option value="ALL" className="bg-[#121620]">
                All Time
              </option>
              <option value="30" className="bg-[#121620]">
                Last 30 Days
              </option>
              <option value="90" className="bg-[#121620]">
                Last 90 Days
              </option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as TopPriorityFilter)
              }
              className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] cursor-pointer"
              aria-label="Filter by Priority"
            >
              <option value="ALL" className="bg-[#121620]">
                All Priorities
              </option>
              <option value="URGENT" className="bg-[#121620]">
                Urgent
              </option>
              <option value="STANDARD" className="bg-[#121620]">
                Standard
              </option>
              <option value="ECONOMY" className="bg-[#121620]">
                Economy
              </option>
            </select>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg text-sm text-white hover:border-[#62ffff] transition-colors cursor-pointer"
              aria-label={`Sort by date ${sortOrder === "desc" ? "newest first" : "oldest first"}`}
            >
              <ArrowUpDown size={14} />
              <span className="text-text-secondary">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
            </button>

            <ShipmentFilters onFilterChange={setAdvancedFilters} />

            {/* Save Current Filters Button / Inline Form */}
            {!isSavingFilter ? (
              <button
                type="button"
                onClick={() => setIsSavingFilter(true)}
                className="px-4 py-2 bg-transparent border border-[rgba(98,255,255,0.3)] hover:bg-[rgba(98,255,255,0.08)] rounded-lg text-sm text-[#62ffff] font-medium transition-colors cursor-pointer"
              >
                Save current filters
              </button>
            ) : (
              <form
                onSubmit={handleSaveFilter}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Filter name..."
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="bg-[rgba(19,186,186,0.05)] border border-[#62ffff] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#62ffff] text-black font-semibold text-sm rounded-lg hover:bg-[#4ae8e8] transition-colors cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSavingFilter(false);
                    setNewFilterName("");
                  }}
                  className="px-3 py-2 bg-transparent text-slate-400 hover:text-white text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {error ? (
            <div
              className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-left"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={22}
                    className="mt-0.5 shrink-0 text-red-300"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="m-0 text-base font-semibold text-red-100">
                      Shipments could not be loaded
                    </h2>
                    <p className="mt-1 text-sm text-red-100/80">{error}</p>
                    <p className="mt-2 text-xs text-red-100/60">
                      Check your connection or API configuration, then retry. Existing filters are preserved.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 transition-colors hover:bg-red-300/10 focus:outline-none focus:ring-2 focus:ring-red-300/40"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              </div>
            </div>
          ) : isEmpty ? (
            <EmptyState
              icon={<Package size={28} />}
              title="No shipments available"
              description="There are no shipments to show yet. Create your first shipment to get started."
              cta={{
                label: "Create Shipment",
                onClick: () => navigate("/dashboard/shipments/create"),
              }}
            />
          ) : isFilterEmpty ? (
            <EmptyState
              icon={<SearchX size={28} />}
              title="No results found"
              description="No shipments match the selected filters. Try adjusting your search or filter criteria."
              cta={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setPriorityFilter("ALL");
                  setTimeframeFilter("ALL");
                  setAdvancedFilters({
                    status: [],
                    dateFrom: "",
                    dateTo: "",
                    carrier: "",
                    origin: "",
                    destination: "",
                    weightMin: "",
                    weightMax: "",
                    priority: [],
                  });
                },
              }}
            />
          ) : (
            <>
              <div className="shipments-summary">
                Showing {filteredShipments.length}
                {isAnyFilterActive
                  ? ` of ${shipments.length} loaded`
                  : ` of ${total}`}{" "}
                shipments
                {sortOrder === "desc" ? " (newest first)" : " (oldest first)"}
              </div>

              {listMode === "grid" ? (
                /* ── Grid card view ── */
                <>
                  <div
                    className={`grid ${listDensity === "compact" ? "gap-2" : "gap-4"} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4`}
                    aria-label="Shipments grid"
                  >
                    {filteredShipments.map((shipment) => {
                      const selected = isSelected(shipment.id);
                      return (
                        <div
                          key={shipment.id}
                          onClick={() =>
                            navigate(`/dashboard/shipments/${shipment.id}`)
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              navigate(`/dashboard/shipments/${shipment.id}`);
                          }}
                          aria-label={`View shipment ${shipment.id}`}
                          className={`relative flex flex-col ${listDensity === "compact" ? "gap-1.5 p-3" : "gap-3 p-4"} rounded-xl border cursor-pointer transition-all duration-200 outline-none
                            focus-visible:ring-2 focus-visible:ring-[#62ffff]/50
                            ${
                              selected
                                ? "bg-[rgba(98,255,255,0.08)] border-[rgba(98,255,255,0.4)]"
                                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.07)] hover:bg-[rgba(98,255,255,0.04)] hover:border-[rgba(98,255,255,0.25)]"
                            }`}
                        >
                          {/* Select checkbox */}
                          <input
                            type="checkbox"
                            aria-label={`Select shipment ${shipment.id}`}
                            checked={selected}
                            onChange={() => toggleOne(shipment.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-3 right-3 cursor-pointer accent-[#62ffff] w-4 h-4"
                          />

                          {/* Shipment ID */}
                          <div className="flex items-center gap-2 pr-6">
                            <Package size={14} className="text-[#62ffff] flex-shrink-0" />
                            <span className="text-[0.75rem] font-mono text-[#62ffff] truncate">
                              {shipment.id}
                            </span>
                          </div>

                          {/* Route */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <span className="font-medium text-slate-300 truncate">{shipment.origin}</span>
                              <span className="text-slate-600">→</span>
                              <span className="font-medium text-slate-300 truncate">{shipment.destination}</span>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={shipment.status} />
                            {shipment.priority && (
                              <PriorityBadge priority={shipment.priority as ShipmentPriority} />
                            )}
                          </div>

                          {/* Date */}
                          <div className="text-[0.7rem] text-slate-600 mt-auto">
                            {safeFormatDate(shipment.createdAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isLoading && (
                    <div className="shipments-loading" aria-live="polite">
                      Loading more shipments…
                    </div>
                  )}
                  {!hasMore && filteredShipments.length > 0 && (
                    <div className="shipments-summary" style={{ marginTop: "0.5rem" }}>
                      {isAnyFilterActive
                        ? `${filteredShipments.length} matching shipments`
                        : `All ${total} shipments loaded`}
                    </div>
                  )}
                </>
              ) : (
                /* ── Table view ── */
                <>
              <table
                className="shipments-table"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr>
                    {/* Header checkbox — selects/deselects all visible rows */}
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        aria-label="Select all visible shipments"
                        checked={allVisibleSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someVisibleSelected;
                        }}
                        onChange={() => toggleAll(visibleIds)}
                        className="cursor-pointer accent-[#62ffff] w-4 h-4"
                      />
                    </th>
                    <th>Shipment ID</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>
                      <button
                        type="button"
                        onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                        className="inline-flex items-center gap-1 bg-transparent border-none text-inherit font-inherit cursor-pointer hover:text-[#62ffff]"
                      >
                        Created Date
                        <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
              </table>

              {/* Virtualised scrollable body */}
              <div
                ref={parentRef}
                onScroll={handleScroll}
                style={{
                  height: "500px",
                  overflowY: "auto",
                  position: "relative",
                }}
              >
                <table
                  className="shipments-table"
                  style={{ tableLayout: "fixed", width: "100%" }}
                  aria-label="Shipments list"
                >
                  <tbody
                    style={{
                      display: "block",
                      height: `${totalSize}px`,
                      position: "relative",
                    }}
                  >
                    {virtualItems.map((virtualRow) => {
                      const shipment = filteredShipments[virtualRow.index];
                      if (!shipment) return null;
                      const selected = isSelected(shipment.id);
                      const riskInfo = getShipmentRiskLevel(shipment);
                      const riskStyle = getShipmentRiskStyle(riskInfo.level);
                      return (
                        <tr
                          key={virtualRow.key}
                          data-index={virtualRow.index}
                          ref={virtualizer.measureElement}
                          aria-selected={selected}
                          className={riskStyle}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualRow.start}px)`,
                            display: "table",
                            tableLayout: "fixed",
                            background: selected
                              ? "rgba(98,255,255,0.06)"
                              : undefined,
                            fontSize: listDensity === "compact" ? "0.78rem" : undefined,
                          }}
                        >
                          {/* Row checkbox */}
                          <td style={{ width: "40px", padding: listDensity === "compact" ? "4px 8px" : undefined }}>
                            <input
                              type="checkbox"
                              aria-label={`Select shipment ${shipment.id}`}
                              checked={selected}
                              onChange={() => toggleOne(shipment.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer accent-[#62ffff] w-4 h-4"
                            />
                          </td>
                          <td>
                            <span className="inline-flex items-center gap-1.5 flex-wrap">
                              {shipment.id}
                              {riskInfo.level !== "normal" && (
                                <OverdueShipmentBadge
                                  level={riskInfo.level}
                                  daysOverdue={riskInfo.daysOverdue}
                                />
                              )}
                            </span>
                          </td>
                          <td>{shipment.origin}</td>
                          <td>{shipment.destination}</td>
                          <td>
                            <StatusBadge status={shipment.status} />
                          </td>
                          <td>
                            <PriorityBadge
                              priority={shipment.priority as ShipmentPriority}
                            />
                          </td>
                          <td>{safeFormatDate(shipment.createdAt)}</td>
                          <td>
                            <button
                              type="button"
                              className="verify-button"
                              onClick={() =>
                                handleRowClick(shipment.id, virtualRow.index)
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {isLoading && (
                <div className="shipments-loading" aria-live="polite">
                  Loading more shipments…
                </div>
              )}

              {!hasMore && filteredShipments.length > 0 && (
                <div
                  className="shipments-summary"
                  style={{ marginTop: "0.5rem" }}
                >
                  {isAnyFilterActive
                    ? `${filteredShipments.length} matching shipments`
                    : `All ${total} shipments loaded`}
                </div>
              )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Floating bulk action bar */}
      <BulkActionBar
        count={selectedCount}
        onUpdateStatus={() => setIsBulkModalOpen(true)}
        onExport={(format) => handleExportSelected(format)}
        onClear={clearSelection}
      />

      {/* Bulk status update modal */}
      <BulkStatusModal
        isOpen={isBulkModalOpen}
        count={selectedCount}
        isLoading={isBulkUpdating}
        onConfirm={handleBulkStatusConfirm}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
};

export default Shipments;
