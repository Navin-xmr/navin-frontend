import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  shipmentApi,
  type Shipment,
  type ShipmentPriority,
} from '../../api/shipmentApi';
import { BulkActionBar } from '../../components/shipment/BulkActionBar';
import { BulkStatusModal } from '../../components/shipment/BulkStatusModal';
import type { ExportFormat } from '@components/ui/ExportDropdown';
import { useToast } from '../../context/ToastContext';
import { useBulkSelection, useDebounce } from '../../hooks';
import { safeFormatDate } from '../../utils/safeFormat';
import ShipmentsKanban from './KanbanView/ShipmentsKanban';
import RouteMap from './RouteMap/RouteMap';

import { useVirtualShipments } from './hooks/useVirtualShipments';
import type { ShipmentFiltersValues, ShipmentStatus } from './ShipmentFilters';

import ShipmentsEmptyState from './components/ShipmentsEmptyState';
import ShipmentsHeader from './components/ShipmentsHeader';
import ShipmentsVirtualTable from './components/ShipmentsVirtualTable';
import {
  ShipmentsFilterToolbar,
  type TopPriorityFilter,
  type TopStatusFilter,
  type TopTimeframeFilter,
} from './components/ShipmentsFilterToolbar';
import { type ShipmentsView } from './components/ShipmentsViewToggle';

const PAGE_SIZE = 50;
const SCROLL_KEY = 'shipments-scroll-index';
const VIEW_KEY = 'shipments-view';

// ---------------------------------------------------------------------------
// Export helpers (keep here — only used by this page)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const Shipments: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-backed filter state (persisted in the query string) ───────────────
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

  const effectiveDateFrom = advancedFilters.dateFrom || timeframeDateFrom;
  const effectiveDateTo = advancedFilters.dateTo;
  const hasMore = shipments.length < total;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      const effectiveStatus = statusKey ? (statusKey.split(',') as ShipmentStatus[]) : undefined;
      const effectivePriority = priorityKey
        ? (priorityKey.split(',') as ShipmentPriority[])
        : undefined;

      try {
        const response = await shipmentApi.getAll({
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
        });
        if (controller.signal.aborted) return;
        setShipments((previous) =>
          currentPage === 1 ? response.data : [...previous, ...response.data],
        );
        setTotal(response.meta.total);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError((caught instanceof Error && caught.message) || 'Unable to load shipments.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
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

  const noResults = !isLoading && !error && total === 0;
  const isEmpty = noResults && !isAnyFilterActive;
  const isFilterEmpty = noResults && isAnyFilterActive;
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className="w-full p-6">
      <ShipmentsHeader
        view={view}
        isExporting={isExporting}
        exportDisabled={isExporting || filteredShipments.length === 0}
        onViewChange={handleViewChange}
        onExportCSV={handleExportCSV}
      />

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
            <ShipmentsVirtualTable
              shipments={filteredShipments}
              total={total}
              isLoading={isLoading}
              allVisibleSelected={allVisibleSelected}
              someVisibleSelected={someVisibleSelected}
              visibleIds={visibleIds}
              parentRef={parentRef}
              virtualItems={virtualItems}
              totalSize={totalSize}
              virtualizer={virtualizer}
              isSelected={isSelected}
              toggleOne={toggleOne}
              toggleAll={toggleAll}
              onRowClick={handleRowClick}
              onScroll={handleScroll}
            />
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
