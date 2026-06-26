import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2 } from 'lucide-react';
import { shipmentApi, type Shipment, type ShipmentPriority } from '../../api/shipmentApi';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import PriorityBadge from '../../components/shipment/PriorityBadge/PriorityBadge';
import { safeFormatDate } from '../../utils/safeFormat';
import { useAuthContext } from '../../context/AuthContext';
import { useVirtualShipments } from './hooks/useVirtualShipments';
import ShipmentsKanban from './KanbanView/ShipmentsKanban';
import './Shipments.css';

function exportShipmentsToCSV(shipments: Shipment[]): void {
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
  const filename = `navin-shipments-${today}.csv`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 50;
const SCROLL_KEY = 'shipments-scroll-index';
const VIEW_KEY = 'shipments-view';

type PriorityFilter = 'ALL' | 'URGENT' | 'STANDARD' | 'ECONOMY';
type ShipmentsView = 'list' | 'kanban';

const Shipments: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuthContext();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const loadingRef = useRef(false);

  const [view, setView] = useState<ShipmentsView>(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === 'kanban' ? 'kanban' : 'list';
    } catch {
      return 'list';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState<'ALL' | '30' | '90'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ShipmentPriority>('ALL');
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [activePriorityMenu, setActivePriorityMenu] = useState<string | null>(null);
  const [updatingPriority, setUpdatingPriority] = useState<string | null>(null);
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

    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      result = result.filter((s) => s.priority === priorityFilter);
    }

    if (timeframeFilter !== 'ALL') {
      const days = parseInt(timeframeFilter, 10);
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - days);
      result = result.filter((s) => new Date(s.createdAt) >= limitDate);
    }

    return result;
  }, [shipments, searchQuery, statusFilter, timeframeFilter, priorityFilter]);

  const handleSaveFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;
    const name = newFilterName.trim();

    if (savedFilters.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      alert('A filter with this name already exists.');
      return;
    }

    const newFilter = {
      name,
      filters: {
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        timeframe: timeframeFilter,
      },
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('navin_saved_filters', JSON.stringify(updated));
    setNewFilterName('');
    setIsSavingFilter(false);
  };

  const handleApplyFilter = (filters: { search: string; status: string; priority: string; timeframe: string }) => {
    setSearchQuery(filters.search || '');
    setStatusFilter((filters.status as 'ALL' | 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED') || 'ALL');
    setPriorityFilter((filters.priority as PriorityFilter) || 'ALL');
    setTimeframeFilter((filters.timeframe as 'ALL' | '30' | '90') || 'ALL');
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

  const isAnyFilterActive = searchQuery !== '' || statusFilter !== 'ALL' || timeframeFilter !== 'ALL' || priorityFilter !== 'ALL';
  const isEmpty = !isLoading && !error && shipments.length === 0;
  const isFilterEmpty = !isLoading && !error && shipments.length > 0 && filteredShipments.length === 0;
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const isCompanyUser = role === 'company';

  return (
    <div className="shipments-page">
      <div className="shipments-header">
        <h1>Shipments</h1>
        <div className="flex items-center gap-3">
          {/* List / Kanban view toggle */}
          <div
            className="inline-flex items-center rounded-lg border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] p-0.5"
            role="group"
            aria-label="Toggle shipments view"
          >
            <button
              type="button"
              onClick={() => handleViewChange('list')}
              aria-pressed={view === 'list'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                view === 'list' ? 'bg-[#62ffff] text-black' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <List size={14} />
              List
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('kanban')}
              aria-pressed={view === 'kanban'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                view === 'kanban' ? 'bg-[#62ffff] text-black' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
          </div>

          <button
            type="button"
            className="export-csv-btn"
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
      </div>

      {view === 'kanban' ? (
        <ShipmentsKanban />
      ) : (
        <>
      {/* Saved filter chips */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4" aria-label="Saved filters">
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
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED')}
          className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] cursor-pointer"
          aria-label="Filter by Status"
        >
          <option value="ALL" className="bg-[#121620]">All Statuses</option>
          <option value="CREATED" className="bg-[#121620]">Created</option>
          <option value="IN_TRANSIT" className="bg-[#121620]">In Transit</option>
          <option value="DELIVERED" className="bg-[#121620]">Delivered</option>
          <option value="CANCELLED" className="bg-[#121620]">Cancelled</option>
        </select>

        {/* Timeframe Filter */}
        <select
          value={timeframeFilter}
          onChange={(e) => setTimeframeFilter(e.target.value as 'ALL' | '30' | '90')}
          className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] cursor-pointer"
          aria-label="Filter by Timeframe"
        >
          <option value="ALL" className="bg-[#121620]">All Time</option>
          <option value="30" className="bg-[#121620]">Last 30 Days</option>
          <option value="90" className="bg-[#121620]">Last 90 Days</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as 'ALL' | ShipmentPriority)}
          className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] cursor-pointer"
          aria-label="Filter by Priority"
        >
          <option value="ALL" className="bg-[#121620]">All Priorities</option>
          <option value="URGENT" className="bg-[#121620]">Urgent</option>
          <option value="STANDARD" className="bg-[#121620]">Standard</option>
          <option value="ECONOMY" className="bg-[#121620]">Economy</option>
        </select>

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
          <form onSubmit={handleSaveFilter} className="flex items-center gap-2">
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
                setNewFilterName('');
              }}
              className="px-3 py-2 bg-transparent text-slate-400 hover:text-white text-sm rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {error ? (
        <div className="shipments-error">{error}</div>
      ) : isEmpty ? (
        <div className="shipments-empty">
          <h3>No shipments available</h3>
          <p>There are no shipments to show.</p>
        </div>
      ) : isFilterEmpty ? (
        <div className="shipments-empty">
          <h3>No results found</h3>
          <p>No shipments match the selected filters.</p>
        </div>
      ) : (
        <>
          <div className="shipments-summary">
            Showing {filteredShipments.length}{isAnyFilterActive ? ` of ${shipments.length} loaded` : ` of ${total}`} shipments
          </div>

          {/* Sticky table header */}
          <table className="shipments-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
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

          {/* Virtualised scrollable body */}
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
              <tbody style={{ display: 'block', height: `${totalSize}px`, position: 'relative' }}>
                {virtualItems.map((virtualRow) => {
                  const shipment = filteredShipments[virtualRow.index];
                  if (!shipment) return null;
                  return (
                    <tr
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                        display: 'table',
                        tableLayout: 'fixed',
                      }}
                    >
                      <td>{shipment.id}</td>
                      <td>{shipment.origin}</td>
                      <td>{shipment.destination}</td>
                      <td>
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td>
                        <PriorityBadge priority={shipment.priority} />
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
              Loading more shipments…
            </div>
          )}

          {!hasMore && filteredShipments.length > 0 && (
            <div className="shipments-summary" style={{ marginTop: '0.5rem' }}>
              {isAnyFilterActive ? `${filteredShipments.length} matching shipments` : `All ${total} shipments loaded`}
            </div>
          )}
        </>
      )}
        </>
      )}
    </div>
  );
};

export default Shipments;
