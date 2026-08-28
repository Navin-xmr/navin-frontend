import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, LayoutGrid, List, Loader2, Map, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shipmentApi, type Shipment, type ShipmentPriority } from '../../api/shipmentApi';
import { BulkActionBar } from '../../components/shipment/BulkActionBar';
import { BulkStatusModal } from '../../components/shipment/BulkStatusModal';
import PriorityBadge from '../../components/shipment/PriorityBadge/PriorityBadge';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import type { ExportFormat } from '../../components/ui/ExportDropdown';
import { useToast } from '../../context/ToastContext';
import { useBulkSelection, useDebounce } from '../../hooks';
import { safeFormatDate } from '../../utils/safeFormat';
import ShipmentsKanban from './KanbanView/ShipmentsKanban';
import RouteMap from './RouteMap/RouteMap';
import ShipmentFilters, {
  type ShipmentFiltersValues,
  type ShipmentStatus,
} from './ShipmentFilters';
import { useVirtualShipments } from './hooks/useVirtualShipments';
import './Shipments.css';

const PAGE_SIZE = 50;
const SCROLL_KEY = 'shipments-scroll-index';
const VIEW_KEY = 'shipments-view';

type ShipmentsView = 'list' | 'kanban' | 'routeMap';
type TopStatusFilter = 'ALL' | ShipmentStatus;
type TopPriorityFilter = 'ALL' | ShipmentPriority;
type TopTimeframeFilter = 'ALL' | '30' | '90';

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

const initialAdvancedFilters: ShipmentFiltersValues = {
  status: [],
  dateFrom: '',
  dateTo: '',
  carrier: '',
  origin: '',
  destination: '',
  weightMin: '',
  weightMax: '',
  priority: [],
};

const Shipments: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
      return saved === 'kanban' || saved === 'routeMap' ? saved : 'list';
    } catch {
      return 'list';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<TopStatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TopPriorityFilter>('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState<TopTimeframeFilter>('ALL');
  const [advancedFilters, setAdvancedFilters] =
    useState<ShipmentFiltersValues>(initialAdvancedFilters);

  const hasMore = shipments.length < total;

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    shipmentApi
      .getAll({ limit: PAGE_SIZE, page: currentPage })
      .then((response) => {
        setShipments((previous) =>
          currentPage === 1 ? response.data : [...previous, ...response.data],
        );
        setTotal(response.meta.total);
      })
      .catch((caught: Error) => {
        setError(caught.message || 'Unable to load shipments.');
      })
      .finally(() => {
        setIsLoading(false);
        loadingRef.current = false;
      });
  }, [currentPage]);

  const filteredShipments = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    let result = shipments;

    if (query) {
      result = result.filter(
        (shipment) =>
          shipment.id.toLowerCase().includes(query) ||
          shipment.origin.toLowerCase().includes(query) ||
          shipment.destination.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((shipment) => shipment.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      result = result.filter((shipment) => shipment.priority === priorityFilter);
    }

    if (timeframeFilter !== 'ALL') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(timeframeFilter));
      result = result.filter((shipment) => new Date(shipment.createdAt) >= cutoff);
    }

    const { status, dateFrom, dateTo, origin, destination, priority } = advancedFilters;

    if (status.length > 0) {
      result = result.filter((shipment) => status.includes(shipment.status));
    }

    if (priority.length > 0) {
      result = result.filter(
        (shipment) => shipment.priority !== undefined && priority.includes(shipment.priority),
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((shipment) => new Date(shipment.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((shipment) => new Date(shipment.createdAt) <= to);
    }

    if (origin) {
      const originQuery = origin.toLowerCase();
      result = result.filter((shipment) => shipment.origin.toLowerCase().includes(originQuery));
    }

    if (destination) {
      const destinationQuery = destination.toLowerCase();
      result = result.filter((shipment) =>
        shipment.destination.toLowerCase().includes(destinationQuery),
      );
    }

    return result;
  }, [
    shipments,
    debouncedSearchQuery,
    statusFilter,
    priorityFilter,
    timeframeFilter,
    advancedFilters,
  ]);

  const visibleIds = useMemo(
    () => filteredShipments.map((shipment) => shipment.id),
    [filteredShipments],
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => isSelected(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => isSelected(id));

  const { parentRef, virtualizer, handleScroll, scrollToIndex } = useVirtualShipments({
    shipments: filteredShipments,
    onLoadMore: () => setCurrentPage((page) => page + 1),
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
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setTimeframeFilter('ALL');
    setAdvancedFilters(initialAdvancedFilters);
  };

  const isAnyFilterActive =
    debouncedSearchQuery !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    timeframeFilter !== 'ALL' ||
    advancedFilters.status.length > 0 ||
    advancedFilters.dateFrom !== '' ||
    advancedFilters.dateTo !== '' ||
    advancedFilters.origin !== '' ||
    advancedFilters.destination !== '' ||
    advancedFilters.priority.length > 0;
  const isEmpty = !isLoading && !error && shipments.length === 0;
  const isFilterEmpty =
    !isLoading && !error && shipments.length > 0 && filteredShipments.length === 0;
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className="shipments-page">
      <div className="shipments-header">
        <h1>Shipments</h1>
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center rounded-lg border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] p-0.5"
            role="group"
            aria-label="Toggle shipments view"
          >
            {[
              { value: 'list' as const, label: 'List', icon: <List size={14} /> },
              { value: 'kanban' as const, label: 'Kanban', icon: <LayoutGrid size={14} /> },
              { value: 'routeMap' as const, label: 'Map', icon: <Map size={14} /> },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleViewChange(option.value)}
                aria-pressed={view === option.value}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  view === option.value
                    ? 'bg-[#62ffff] text-black'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="export-csv-btn"
            onClick={handleExportCSV}
            disabled={isExporting || filteredShipments.length === 0}
            aria-label="Export shipments to CSV"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Exporting' : 'Export CSV'}
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <ShipmentsKanban />
      ) : view === 'routeMap' ? (
        <RouteMap />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
            <div className="flex-1 min-w-[280px]">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by ID, origin, or destination..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as TopStatusFilter)}
              className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff] cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="ALL" className="bg-[#121620]">All Statuses</option>
              <option value="CREATED" className="bg-[#121620]">Created</option>
              <option value="IN_TRANSIT" className="bg-[#121620]">In Transit</option>
              <option value="DELIVERED" className="bg-[#121620]">Delivered</option>
              <option value="CANCELLED" className="bg-[#121620]">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as TopPriorityFilter)}
              className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff] cursor-pointer"
              aria-label="Filter by priority"
            >
              <option value="ALL" className="bg-[#121620]">All Priorities</option>
              <option value="URGENT" className="bg-[#121620]">Urgent</option>
              <option value="STANDARD" className="bg-[#121620]">Standard</option>
              <option value="ECONOMY" className="bg-[#121620]">Economy</option>
            </select>

            <select
              value={timeframeFilter}
              onChange={(event) => setTimeframeFilter(event.target.value as TopTimeframeFilter)}
              className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff] cursor-pointer"
              aria-label="Filter by timeframe"
            >
              <option value="ALL" className="bg-[#121620]">All Time</option>
              <option value="30" className="bg-[#121620]">Last 30 Days</option>
              <option value="90" className="bg-[#121620]">Last 90 Days</option>
            </select>

            <ShipmentFilters onFilterChange={setAdvancedFilters} />
          </div>

          {error ? (
            <div className="shipments-error" role="alert">{error}</div>
          ) : isEmpty ? (
            <div className="shipments-empty">
              <h3>No shipments available</h3>
              <p>There are no shipments to show.</p>
            </div>
          ) : isFilterEmpty ? (
            <div className="shipments-empty">
              <h3>No results found</h3>
              <p>No shipments match the selected filters.</p>
              <button type="button" className="verify-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="shipments-summary">
                Showing {filteredShipments.length}
                {isAnyFilterActive ? ` of ${shipments.length} loaded` : ` of ${total}`} shipments
              </div>

              <table className="shipments-table" style={{ tableLayout: 'fixed', width: '100%' }}>
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
                  className="shipments-table"
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
                              className="verify-button"
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
                <div className="shipments-loading" aria-live="polite">
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
