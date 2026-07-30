import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, LayoutList, LayoutGrid, List, Map } from 'lucide-react';
import { shipmentApi, type Shipment, type ShipmentPriority } from '../../api/shipmentApi';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import PriorityBadge from '../../components/shipment/PriorityBadge/PriorityBadge';
import { BulkActionBar } from '../../components/shipment/BulkActionBar';
import { BulkStatusModal } from '../../components/shipment/BulkStatusModal';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import { useToast } from '../../context/ToastContext';
import { safeFormatDate } from '../../utils/safeFormat';
import { useVirtualShipments } from './hooks/useVirtualShipments';
import ShipmentsKanban from './KanbanView/ShipmentsKanban';
import RouteMap from './RouteMap/RouteMap';
import ShipmentFilters, { type ShipmentFiltersValues, type ShipmentStatus, type Priority } from './ShipmentFilters';

function exportShipmentsToCSV(shipments: Shipment[], filename?: string): void {
  const headers = ['Tracking Number', 'Origin', 'Destination', 'Status', 'Created At', 'Expected Delivery', 'Carrier'];
  const rows = shipments.map((s) => [
    s.id,
    s.origin,
    s.destination,
    s.status,
    safeFormatDate(s.createdAt),
    'N/A',
    'N/A',
  ]);

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');

  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `navin-shipments-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 50;
const SCROLL_KEY = 'shipments-scroll-index';
const VIEW_KEY = 'shipments-view';

type ShipmentsView = 'list' | 'kanban' | 'routeMap';

const Shipments: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
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

  const [viewMode, setViewMode] = useState<ShipmentsView>(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === 'kanban' || saved === 'routeMap') return saved;
      return 'list';
    } catch {
      return 'list';
    }
  });

  const handleViewChange = (next: ShipmentsView) => {
    setViewMode(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // ignore persistence failures
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState<'ALL' | '30' | '90'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ShipmentPriority>('ALL');
  const [advancedFilters, setAdvancedFilters] = useState<ShipmentFiltersValues>({
    status: [],
    dateFrom: '',
    dateTo: '',
    carrier: '',
    origin: '',
    destination: '',
    weightMin: '',
    weightMax: '',
    priority: [],
  });
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [savedFilters, setSavedFilters] = useState<{
    name: string;
    filters: { search: string; status: string; priority: string; timeframe: string };
  }[]>(() => {
    try {
      const raw = localStorage.getItem('navin_saved_filters');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const hasMore = shipments.length < total;

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

    const { status, dateFrom, dateTo, origin, destination, priority } = advancedFilters;

    if (status.length > 0) {
      result = result.filter((s) => status.includes(s.status));
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
      result = result.filter((s) => s.priority && priority.includes(s.priority));
    }

    if (origin) {
      const o = origin.toLowerCase();
      result = result.filter((s) => s.origin.toLowerCase().includes(o));
    }

    if (destination) {
      const d = destination.toLowerCase();
      result = result.filter((s) => s.destination.toLowerCase().includes(d));
    }
    return result;
  }, [shipments, searchQuery, advancedFilters]);

  const visibleIds = useMemo(() => filteredShipments.map((s) => s.id), [filteredShipments]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => isSelected(id));
  const someVisibleSelected = !allVisibleSelected && visibleIds.some((id) => isSelected(id));

  const handleSaveFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;
    const name = newFilterName.trim();

    if (savedFilters.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      alert('A filter with this name already exists.');
      return;
    }

    const savedStatus = advancedFilters.status.length === 1 ? advancedFilters.status[0] : 'ALL';
    const savedPriority = advancedFilters.priority.length === 1 ? advancedFilters.priority[0] : 'ALL';

    const newFilter = {
      name,
      filters: {
        search: searchQuery,
        status: savedStatus,
        priority: savedPriority,
        timeframe: 'ALL',
      },
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('navin_saved_filters', JSON.stringify(updated));
    setNewFilterName('');
    setIsSavingFilter(false);
  };

  const handleApplyFilter = (saved: { search: string; status: string; priority: string; timeframe: string }) => {
    setSearchQuery(saved.search || '');
    setAdvancedFilters({
      status: saved.status !== 'ALL' ? [saved.status as ShipmentStatus] : [],
      dateFrom: '',
      dateTo: '',
      carrier: '',
      origin: '',
      destination: '',
      weightMin: '',
      weightMax: '',
      priority: saved.priority !== 'ALL' ? [saved.priority as Priority] : [],
    });
  };

  const handleDeleteFilter = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedFilters.filter((f) => f.name !== name);
    setSavedFilters(updated);
    localStorage.setItem('navin_saved_filters', JSON.stringify(updated));
  };

  const { parentRef, virtualizer, handleScroll, scrollToIndex } = useVirtualShipments({
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
        setError(err.message || 'Unable to load shipments.');
      })
      .finally(() => {
        setIsLoading(false);
        loadingRef.current = false;
      });
  }, [currentPage]);

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

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportShipmentsToCSV(shipments);
      setIsExporting(false);
    }, 0);
  };

  const handleExportSelected = () => {
    const selectedShipments = shipments.filter(s => isSelected(s.id));
    if (selectedShipments.length > 0) {
      exportShipmentsToCSV(selectedShipments, `navin-selected-shipments-${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  const handleBulkStatusConfirm = async (newStatus: ShipmentStatus) => {
    if (selectedIds.size === 0) return;
    setIsBulkUpdating(true);
    try {
      await shipmentApi.bulkUpdateStatus(Array.from(selectedIds), newStatus);
      setShipments(prev => prev.map(s => selectedIds.has(s.id) ? { ...s, status: newStatus } as Shipment : s));
      addToast('Status updated successfully', 'success');
      clearSelection();
      setIsBulkModalOpen(false);
    } catch {
      addToast('Failed to update status', 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };


  const isAnyFilterActive =
    searchQuery !== '' ||
    advancedFilters.status.length > 0 ||
    advancedFilters.dateFrom !== '' ||
    advancedFilters.dateTo !== '' ||
    advancedFilters.carrier !== '' ||
    advancedFilters.origin !== '' ||
    advancedFilters.destination !== '' ||
    advancedFilters.weightMin !== '' ||
    advancedFilters.weightMax !== '' ||
    advancedFilters.priority.length > 0;
  const isEmpty = !isLoading && !error && shipments.length === 0;
  const isFilterEmpty = !isLoading && !error && shipments.length > 0 && filteredShipments.length === 0;
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();


  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold">Shipments</h1>
          <div className="inline-flex flex-wrap items-center rounded-2xl border border-[rgba(98,255,255,0.15)] bg-[rgba(255,255,255,0.03)] p-1 gap-1">
            <button
              type="button"
              onClick={() => handleViewChange('list')}
              aria-pressed={viewMode === 'list'}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                viewMode === 'list' ? 'bg-[#62ffff] text-black' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <List size={14} />
              List
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('kanban')}
              aria-pressed={viewMode === 'kanban'}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                viewMode === 'kanban' ? 'bg-[#62ffff] text-black' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('routeMap')}
              aria-pressed={viewMode === 'routeMap'}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                viewMode === 'routeMap' ? 'bg-[#62ffff] text-black' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Map size={14} />
              Route Map
            </button>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(98,255,255,0.3)] bg-transparent px-4 py-2 text-sm font-medium text-[#62ffff] transition hover:bg-[rgba(98,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleExportCSV}
          disabled={isExporting || shipments.length === 0}
          aria-label="Export shipments to CSV"
        >
          {isExporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {isExporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {savedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Saved filters">
          {savedFilters.map((sf) => (
            <button
              key={sf.name}
              type="button"
              onClick={() => handleApplyFilter(sf.filters)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(98,255,255,0.2)] bg-[rgba(98,255,255,0.06)] px-3 py-1 text-xs font-medium text-[#62ffff] transition hover:bg-[rgba(98,255,255,0.12)]"
            >
              <span>{sf.name}</span>
              <span
                onClick={(e) => handleDeleteFilter(sf.name, e)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-[#62ffff] transition hover:bg-[rgba(255,255,255,0.15)]"
                role="button"
                aria-label={`Delete ${sf.name} filter`}
              >
                ×
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 min-w-[220px]">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by ID, origin, or destination..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:max-w-[720px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED')}
            className="min-w-[140px] rounded-lg border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] px-3 py-2 text-sm text-white outline-none focus:border-[#62ffff]"
            aria-label="Filter by Status"
          >
            <option value="ALL" className="bg-[#121620]">All Statuses</option>
            <option value="CREATED" className="bg-[#121620]">Created</option>
            <option value="IN_TRANSIT" className="bg-[#121620]">In Transit</option>
            <option value="DELIVERED" className="bg-[#121620]">Delivered</option>
            <option value="CANCELLED" className="bg-[#121620]">Cancelled</option>
          </select>

          <select
            value={timeframeFilter}
            onChange={(e) => setTimeframeFilter(e.target.value as 'ALL' | '30' | '90')}
            className="rounded-lg border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] px-3 py-2 text-sm text-white outline-none focus:border-[#62ffff]"
            aria-label="Filter by Timeframe"
          >
            <option value="ALL" className="bg-[#121620]">All Time</option>
            <option value="30" className="bg-[#121620]">Last 30 Days</option>
            <option value="90" className="bg-[#121620]">Last 90 Days</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'ALL' | ShipmentPriority)}
            className="rounded-lg border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] px-3 py-2 text-sm text-white outline-none focus:border-[#62ffff]"
            aria-label="Filter by Priority"
          >
            <option value="ALL" className="bg-[#121620]">All Priorities</option>
            <option value="URGENT" className="bg-[#121620]">Urgent</option>
            <option value="STANDARD" className="bg-[#121620]">Standard</option>
            <option value="ECONOMY" className="bg-[#121620]">Economy</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-white">
            <p className="text-lg font-semibold">Unable to load shipments</p>
            <p className="mt-2 text-sm text-slate-300">{error}</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <ShipmentsKanban shipments={filteredShipments} isLoading={isLoading} />
        ) : viewMode === 'routeMap' ? (
          <RouteMap />
        ) : isEmpty ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[#62ffff]">No Shipments</p>
            <h2 className="mt-4 text-2xl font-semibold">No shipments available yet</h2>
            <p className="mt-2 text-sm text-slate-400">Create a shipment or update filters to begin tracking deliveries.</p>
          </div>
        ) : isFilterEmpty ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[#62ffff]">No results</p>
            <h2 className="mt-4 text-2xl font-semibold">No shipments match your filters</h2>
            <p className="mt-2 text-sm text-slate-400">Try adjusting the search or removing filter rules to see more results.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
              Showing {filteredShipments.length}{isAnyFilterActive ? ` of ${shipments.length} loaded` : ` of ${total}`} shipments
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm text-left">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      <th className="w-10 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <input
                          type="checkbox"
                          aria-label="Select all visible shipments"
                          checked={allVisibleSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someVisibleSelected;
                          }}
                          onChange={() => toggleAll(visibleIds)}
                          className="h-4 w-4 cursor-pointer accent-[#62ffff]"
                        />
                      </th>
                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Shipment ID</th>
                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Origin</th>
                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Destination</th>
                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Priority</th>
                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Created Date</th>
                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                    </tr>
                  </thead>
                </table>
              </div>

              <div
                ref={parentRef}
                onScroll={handleScroll}
                style={{ height: '500px', overflowY: 'auto', position: 'relative' }}
              >
                <table
                  className="min-w-full table-fixed border-separate border-spacing-0 text-sm"
                  style={{ tableLayout: 'fixed', width: '100%' }}
                  aria-label="Shipments list"
                >
                  <tbody style={{ display: 'block', height: `${totalSize}px`, position: 'relative' }}>
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
                          className="group"
                        >
                          <td className="w-10 px-4 py-4 align-top">
                            <input
                              type="checkbox"
                              aria-label={`Select shipment ${shipment.id}`}
                              checked={selected}
                              onChange={() => toggleOne(shipment.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 cursor-pointer accent-[#62ffff]"
                            />
                          </td>
                          <td className="px-4 py-4 align-top text-slate-100">{shipment.id}</td>
                          <td className="px-4 py-4 align-top text-slate-100">{shipment.origin}</td>
                          <td className="px-4 py-4 align-top text-slate-100">{shipment.destination}</td>
                          <td className="px-4 py-4 align-top">
                            <StatusBadge status={shipment.status} />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <PriorityBadge priority={shipment.priority as ShipmentPriority} />
                          </td>
                          <td className="px-4 py-4 align-top text-slate-300">{safeFormatDate(shipment.createdAt)}</td>
                          <td className="px-4 py-4 align-top">
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
            </div>

            {isLoading && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-slate-300" aria-live="polite">
                Loading more shipments…
              </div>
            )}

            {!hasMore && filteredShipments.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                {isAnyFilterActive ? `${filteredShipments.length} matching shipments` : `All ${total} shipments loaded`}
              </div>
            )}
          </div>
        </div>
      )}

      <BulkActionBar
        count={selectedCount}
        onUpdateStatus={() => setIsBulkModalOpen(true)}
        onExport={handleExportSelected}
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
