import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Package } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  shipmentApi,
  type Shipment,
  type ShipmentPriority,
} from '../../api/shipmentApi';
import { BulkActionBar } from '../../components/shipment/BulkActionBar';
import { BulkStatusModal } from '../../components/shipment/BulkStatusModal';
import PriorityBadge from '../../components/shipment/PriorityBadge/PriorityBadge';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import type { ExportFormat } from '@components/ui/ExportDropdown';
import { useToast } from '../../context/ToastContext';
import { useBulkSelection, useDebounce } from '../../hooks';
import { safeFormatDate } from '../../utils/safeFormat';
import ShipmentsKanban from './KanbanView/ShipmentsKanban';
import RouteMap from './RouteMap/RouteMap';

import { useVirtualShipments } from './hooks/useVirtualShipments';
import type { ShipmentFiltersValues, ShipmentStatus } from './ShipmentFilters';

import ShipmentsEmptyState from './components/ShipmentsEmptyState';
import ShipmentsExportButton from './components/ShipmentsExportButton';
import {
  ShipmentsFilterToolbar,
  type TopPriorityFilter,
  type TopStatusFilter,
  type TopTimeframeFilter,
} from './components/ShipmentsFilterToolbar';
import { ShipmentsViewToggle, type ShipmentsView } from './components/ShipmentsViewToggle';

const PAGE_SIZE = 50;
const SCROLL_KEY = 'shipments-scroll-index';
const VIEW_KEY = 'shipments-view';


function exportShipmentsToCSV(shipments: Shipment[], filename?: string): void {
  const headers = ['Tracking Number', 'Origin', 'Destination', 'Status', 'Created At'];
  const rows = shipments.map((shipment) => [
    shipment.id,
    shipment.origin,
    shipment.destination,
    shipment.status,
    safeFormatDate(shipment.createdAt),
  ]);
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n');
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `navin-shipments-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportShipmentsToJSON(shipments: Shipment[], filename?: string): void {
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(shipments, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `navin-shipments-${today}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

const Shipments: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-backed filter state (persisted in the query string) ───────────────
  // The URL is the single source of truth for filters. The advanced filter
  // panel writes the same plain keys (status, priority, carrier, ...) itself,
  // so both it and the toolbar dropdowns are read from here; `status` and
  // `priority` may hold a comma-separated list.
  const csvParam = (key: string) => searchParams.get(key)?.split(',').filter(Boolean) ?? [];
  const searchQuery = searchParams.get('q') ?? '';
  const statusList = csvParam('status') as ShipmentStatus[];
  const priorityList = csvParam('priority') as ShipmentPriority[];
  const statusFilter: TopStatusFilter = statusList.length === 1 ? statusList[0] : 'ALL';
  const priorityFilter: TopPriorityFilter = priorityList.length === 1 ? priorityList[0] : 'ALL';
  const timeframeFilter = (searchParams.get('timeframe') as TopTimeframeFilter) ?? 'ALL';
  const currentPage = Number(searchParams.get('page') ?? '1');

  const advancedFilters: ShipmentFiltersValues = {
    status: statusList,
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
    carrier: searchParams.get('carrier') ?? '',
    origin: searchParams.get('origin') ?? '',
    destination: searchParams.get('destination') ?? '',
    weightMin: searchParams.get('weightMin') ?? '',
    weightMax: searchParams.get('weightMax') ?? '',
    priority: priorityList,
  };
  const statusKey = statusList.join(',');
  const priorityKey = priorityList.join(',');
  const advancedOrigin = advancedFilters.origin;
  const advancedDestination = advancedFilters.destination;
  const advancedCarrier = advancedFilters.carrier;
  const advancedWeightMin = advancedFilters.weightMin;
  const advancedWeightMax = advancedFilters.weightMax;

  /** Update one or more search params, always resetting page to 1 unless explicitly set. */
  const updateFilters = useCallback(
    (updates: Record<string, string | string[] | null>, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
              next.delete(key);
            } else if (Array.isArray(value)) {
              next.delete(key);
              for (const v of value) next.append(key, v);
            } else {
              next.set(key, value);
            }
          }
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      updateFilters({ page: page > 1 ? String(page) : null }, false);
    },
    [updateFilters],
  );

  // ── Server data ───────────────────────────────────────────────────────────
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
      return saved === 'kanban' || saved === 'routeMap' ? saved : 'list';
    } catch {
      return 'list';
    }
  });

  // Compute the effective date range from the timeframe shortcut.
  const timeframeDateFrom = (() => {
    if (timeframeFilter === 'ALL') return '';
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(timeframeFilter));
    return cutoff.toISOString().slice(0, 10);
  })();

  // Effective date range merges the timeframe shortcut and advanced dateFrom.
  const effectiveDateFrom = advancedFilters.dateFrom || timeframeDateFrom;
  const effectiveDateTo = advancedFilters.dateTo;

  const hasMore = shipments.length < total;

  useEffect(() => {
    // Cancel any previous in-flight request.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    // Every active filter is sent to the API on every request, so the server
    // filters across ALL pages (not just the one that happens to be loaded).
    const effectiveStatus = statusKey ? (statusKey.split(',') as ShipmentStatus[]) : undefined;
    const effectivePriority = priorityKey
      ? (priorityKey.split(',') as ShipmentPriority[])
      : undefined;

    shipmentApi
      .getAll({
        limit: PAGE_SIZE,
        page: currentPage,
        search: debouncedSearchQuery || undefined,
        status: effectiveStatus,
        priority: effectivePriority,
        dateFrom: effectiveDateFrom || undefined,
        dateTo: effectiveDateTo || undefined,
        origin: advancedOrigin || undefined,
        destination: advancedDestination || undefined,
        carrier: advancedCarrier || undefined,
        weightMin: advancedWeightMin || undefined,
        weightMax: advancedWeightMax || undefined,
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted) return;
        setShipments((previous) =>
          currentPage === 1 ? response.data : [...previous, ...response.data],
        );
        setTotal(response.meta.total);
      })
      .catch((caught: Error) => {
        if (controller.signal.aborted) return;
        setError(caught.message || 'Unable to load shipments.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [
    currentPage,
    debouncedSearchQuery,
    statusKey,
    priorityKey,
    effectiveDateFrom,
    effectiveDateTo,
    advancedOrigin,
    advancedDestination,
    advancedCarrier,
    advancedWeightMin,
    advancedWeightMax,
  ]);

  // filteredShipments == shipments (server already filtered)
  const filteredShipments = shipments;

  const visibleIds = shipments.map((shipment) => shipment.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => isSelected(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => isSelected(id));

  const { parentRef, virtualizer, handleScroll, scrollToIndex } = useVirtualShipments({
    shipments: filteredShipments,
    onLoadMore: () => setCurrentPage(currentPage + 1),
    hasMore,
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const index = Number.parseInt(saved, 10);
      if (!Number.isNaN(index) && index > 0) {
        requestAnimationFrame(() => scrollToIndex(index));
      }
    }

    return () => {
      sessionStorage.removeItem(SCROLL_KEY);
    };
  }, [scrollToIndex]);

  const handleViewChange = (next: ShipmentsView) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Ignore persistence failures.
    }
  };

  const handleRowClick = (shipmentId: string, index: number) => {
    sessionStorage.setItem(SCROLL_KEY, String(index));
    navigate(`/dashboard/shipments/${shipmentId}`);
  };

  const exportShipments = (format: ExportFormat, selectedOnly = false) => {
    const rows = selectedOnly
      ? shipments.filter((shipment) => selectedIds.has(shipment.id))
      : filteredShipments;
    const prefix = selectedOnly ? 'navin-selected-shipments' : 'navin-shipments';
    const date = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      exportShipmentsToJSON(rows, `${prefix}-${date}.json`);
      return;
    }

    exportShipmentsToCSV(rows, `${prefix}-${date}.csv`);
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    window.setTimeout(() => {
      exportShipments('csv');
      setIsExporting(false);
    }, 0);
  };

  const handleBulkStatusConfirm = async (newStatus: ShipmentStatus) => {
    if (selectedIds.size === 0) return;

    const previousShipments = shipments;
    setShipments((current) =>
      current.map((shipment) =>
        selectedIds.has(shipment.id) ? { ...shipment, status: newStatus } : shipment,
      ),
    );
    clearSelection();
    setIsBulkModalOpen(false);
    setIsBulkUpdating(true);

    try {
      await shipmentApi.bulkUpdateStatus(Array.from(selectedIds), newStatus);
      addToast('Status updated successfully', 'success');
    } catch {
      setShipments(previousShipments);
      addToast('Failed to update status', 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const isAnyFilterActive =
    debouncedSearchQuery !== '' ||
    timeframeFilter !== 'ALL' ||
    advancedFilters.status.length > 0 ||
    advancedFilters.dateFrom !== '' ||
    advancedFilters.dateTo !== '' ||
    advancedFilters.origin !== '' ||
    advancedFilters.destination !== '' ||
    advancedFilters.carrier !== '' ||
    advancedFilters.weightMin !== '' ||
    advancedFilters.weightMax !== '' ||
    advancedFilters.priority.length > 0;
  // The server does the filtering, so "no results" is simply total === 0. Tell
  // "nothing exists" apart from "nothing matches these filters" so the user can
  // clear the filters instead of assuming there are no shipments at all.
  const noResults = !isLoading && !error && total === 0;
  const isEmpty = noResults && !isAnyFilterActive;
  const isFilterEmpty = noResults && isAnyFilterActive;
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-2xl font-semibold m-0">Shipments</h1>
        <div className="flex items-center gap-3">
          <ShipmentsViewToggle view={view} onViewChange={handleViewChange} />

          <ShipmentsExportButton
            isExporting={isExporting}
            disabled={isExporting || filteredShipments.length === 0}
            onExport={handleExportCSV}
          />
        </div>
      </div>

      {view === 'kanban' ? (
        <ShipmentsKanban />
      ) : view === 'routeMap' ? (
        <RouteMap />
      ) : (
        <>
          <ShipmentsFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => updateFilters({ q: q || null })}
            statusFilter={statusFilter}
            onStatusChange={(s) => updateFilters({ status: s === 'ALL' ? null : s })}
            priorityFilter={priorityFilter}
            onPriorityChange={(p) => updateFilters({ priority: p === 'ALL' ? null : p })}
            timeframeFilter={timeframeFilter}
            onTimeframeChange={(t) => updateFilters({ timeframe: t === 'ALL' ? null : t })}
          />

          {isEmpty || error || isFilterEmpty ? (
            <ShipmentsEmptyState
              error={error}
              isEmpty={isEmpty}
              isFilterEmpty={isFilterEmpty}
              onClearFilters={clearFilters}
            />
          ) : (
            <>
              <div className="text-sm text-[#94a3b8] mb-3">
                Showing {filteredShipments.length}
                {` of ${total}`} shipments
              </div>

              <table
                className="w-full mt-4 border-collapse text-inherit [&_th]:px-3 [&_th]:py-2.5 [&_th]:border-b [&_th]:border-[var(--border-color)] [&_th]:text-left [&_th]:leading-[1.35] [&_th]:align-middle [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.02em] [&_th]:text-xs [&_th]:whitespace-nowrap [&_td]:px-3 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-[var(--border-color)] [&_td]:text-left [&_td]:leading-[1.35] [&_td]:align-middle [&_td]:[overflow-wrap:anywhere]"
                style={{ tableLayout: 'fixed', width: '100%' }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        aria-label="Select all visible shipments"
                        checked={allVisibleSelected}
                        ref={(element) => {
                          if (element) element.indeterminate = someVisibleSelected;
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
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
              </table>

              <div
                ref={parentRef}
                onScroll={handleScroll}
                style={{ height: '500px', overflowY: 'auto', position: 'relative' }}
              >
                <table
                  className="w-full mt-4 border-collapse text-inherit [&_th]:px-3 [&_th]:py-2.5 [&_th]:border-b [&_th]:border-[var(--border-color)] [&_th]:text-left [&_th]:leading-[1.35] [&_th]:align-middle [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.02em] [&_th]:text-xs [&_th]:whitespace-nowrap [&_td]:px-3 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-[var(--border-color)] [&_td]:text-left [&_td]:leading-[1.35] [&_td]:align-middle [&_td]:[overflow-wrap:anywhere]"
                  style={{ tableLayout: 'fixed', width: '100%' }}
                  aria-label="Shipments list"
                >
                  <tbody
                    style={{
                      display: 'block',
                      height: `${totalSize}px`,
                      position: 'relative',
                    }}
                  >
                    {virtualItems.map((virtualRow) => {
                      const shipment = filteredShipments[virtualRow.index];
                      if (!shipment) return null;
                      const selected = isSelected(shipment.id);

                      return (
                        <tr
                          key={virtualRow.key}
                          data-index={virtualRow.index}
                          ref={virtualizer.measureElement}
                          aria-selected={selected}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                            display: 'table',
                            tableLayout: 'fixed',
                            background: selected ? 'rgba(98,255,255,0.06)' : undefined,
                          }}
                        >
                          <td style={{ width: '40px' }}>
                            <input
                              type="checkbox"
                              aria-label={`Select shipment ${shipment.id}`}
                              checked={selected}
                              onChange={() => toggleOne(shipment.id)}
                              onClick={(event) => event.stopPropagation()}
                              className="cursor-pointer accent-[#62ffff] w-4 h-4"
                            />
                          </td>
                          <td>
                            <span className="inline-flex items-center gap-1.5">
                              <Package size={14} className="text-[#62ffff]" />
                              {shipment.id}
                            </span>
                          </td>
                          <td>{shipment.origin}</td>
                          <td>{shipment.destination}</td>
                          <td><StatusBadge status={shipment.status} /></td>
                          <td>
                            {shipment.priority ? (
                              <PriorityBadge priority={shipment.priority} />
                            ) : (
                              <span className="text-[#64748b]">N/A</span>
                            )}
                          </td>
                          <td>{safeFormatDate(shipment.createdAt)}</td>
                          <td>
                            <button
                              type="button"
                              className="rounded-lg bg-[#62ffff] px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-[#4ae8e8]"
                              onClick={() => handleRowClick(shipment.id, virtualRow.index)}
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
                <div className="py-8 px-6 text-center text-[var(--text-secondary)]" aria-live="polite">
                  Loading more shipments...
                </div>
              )}
            </>
          )}
        </>
      )}

      <BulkActionBar
        count={selectedCount}
        onUpdateStatus={() => setIsBulkModalOpen(true)}
        onExport={(format) => exportShipments(format, true)}
        onClear={clearSelection}
      />
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
