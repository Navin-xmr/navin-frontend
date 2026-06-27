import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Shipment } from '../../../api/shipmentApi';
import type { ShipmentStatus } from '../../../services/api/endpoints/shipments';
import { getStatusDisplayLabel, getStatusBadgeClass } from '../../../utils/shipmentStatus';
import { safeFormatDate } from '../../../utils/safeFormat';

export interface ShipmentsKanbanProps {
  shipments: Shipment[];
  isLoading: boolean;
}

const COLUMNS: { status: ShipmentStatus; label: string }[] = [
  { status: 'CREATED', label: 'Created' },
  { status: 'IN_TRANSIT', label: 'In Transit' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'CANCELLED', label: 'Cancelled' },
];

const COLUMN_LIMIT = 50;
const PAGE_SIZE = 10;

const COLUMN_HEADER_CLASSES: Record<ShipmentStatus, string> = {
  CREATED: 'border-[#f59e0b] text-[#f59e0b]',
  IN_TRANSIT: 'border-[#3b82f6] text-[#3b82f6]',
  DELIVERED: 'border-[#10b981] text-[#10b981]',
  CANCELLED: 'border-[#ef4444] text-[#ef4444]',
};

interface KanbanCardProps {
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { shipmentApi, type Shipment } from '../../../api/shipmentApi';
import type { ShipmentStatus } from '../../../services/api/endpoints/shipments';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import { safeFormatDate } from '../../../utils/safeFormat';

const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const INITIAL_COLUMN_LIMIT = 50;
const COLUMN_INCREMENT = 50;

interface ColumnConfig {
  status: ShipmentStatus;
  title: string;
  accent: string;
}

const COLUMNS: ColumnConfig[] = [
  { status: 'CREATED', title: 'Created', accent: 'bg-slate-400' },
  { status: 'IN_TRANSIT', title: 'In Transit', accent: 'bg-sky-400' },
  { status: 'DELIVERED', title: 'Delivered', accent: 'bg-emerald-400' },
  { status: 'CANCELLED', title: 'Cancelled', accent: 'bg-rose-400' },
];

/** Fetch every shipment by walking the paginated endpoint. */
async function fetchAllShipments(): Promise<Shipment[]> {
  const all: Shipment[] = [];
  let page = 1;
  let total = Infinity;

  while (all.length < total && page <= MAX_PAGES) {
    const response = await shipmentApi.getAll({ limit: PAGE_SIZE, page });
    all.push(...response.data);
    total = response.meta.total;
    if (response.data.length === 0) break;
    page += 1;
  }

  return all;
}

interface ShipmentCardProps {
  shipment: Shipment;
  onClick: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ shipment, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(98,255,255,0.2)] rounded-lg p-3 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#62ffff]"
    aria-label={`View shipment ${shipment.id}`}
  >
    <div className="flex items-center justify-between gap-2 mb-2">
      <span className="text-xs font-mono text-[#62ffff] truncate">{shipment.id}</span>
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getStatusBadgeClass(shipment.status)}`}
      >
        {getStatusDisplayLabel(shipment.status)}
      </span>
    </div>
    <div className="text-xs text-slate-300 mb-1 truncate">
      {shipment.origin} → {shipment.destination}
    </div>
    <div className="text-[11px] text-slate-500">
      {safeFormatDate(shipment.createdAt)}
const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left bg-[#14171e] border border-[#1e293b] rounded-lg p-3 hover:border-[rgba(98,255,255,0.4)] hover:bg-[rgba(19,186,186,0.06)] focus:outline-none focus:border-[#62ffff] transition-colors cursor-pointer"
    aria-label={`Open shipment ${shipment.id}`}
  >
    <div className="flex items-center justify-between gap-2 mb-2">
      <span className="font-mono text-xs text-[#62ffff] truncate">{shipment.id}</span>
      <PriorityBadge priority={shipment.priority} />
    </div>

    <div className="flex items-center gap-1.5 text-[#cbd5e1] text-sm mb-2">
      <MapPin className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
      <span className="truncate">{shipment.origin}</span>
      <span className="text-[#64748b]">→</span>
      <span className="truncate">{shipment.destination}</span>
    </div>

    <div className="text-[11px] text-[#94a3b8]">
      Expected delivery: {safeFormatDate(shipment.createdAt)}
    </div>
  </button>
);

interface KanbanColumnProps {
  status: ShipmentStatus;
  label: string;
  shipments: Shipment[];
  onCardClick: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, label, shipments, onCardClick }) => {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const capped = shipments.slice(0, COLUMN_LIMIT);
  const shown = capped.slice(0, visible);
  const hasMore = visible < capped.length;

  return (
    <div className="flex flex-col min-w-[260px] flex-1 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden">
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${COLUMN_HEADER_CLASSES[status]}`}>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs bg-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-full text-slate-400">
          {capped.length}{shipments.length > COLUMN_LIMIT ? '+' : ''}
        </span>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-280px)] min-h-[120px]">
        {shown.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-6">No shipments</p>
        ) : (
          shown.map((s) => (
            <KanbanCard key={s.id} shipment={s} onClick={() => onCardClick(s.id)} />
          ))
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full py-2 text-xs text-[#62ffff] hover:text-white border border-[rgba(98,255,255,0.2)] hover:border-[rgba(98,255,255,0.4)] rounded-lg transition-colors cursor-pointer"
          >
            Load more ({capped.length - visible} remaining)
          </button>
        )}
      </div>
    </div>
  );
};

const ShipmentsKanban: React.FC<ShipmentsKanbanProps> = ({ shipments, isLoading }) => {
  const navigate = useNavigate();

  const grouped = React.useMemo(() => {
    const map: Record<ShipmentStatus, Shipment[]> = {
const ShipmentsKanban: React.FC = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;

    fetchAllShipments()
      .then((data) => {
        if (active) setShipments(data);
      })
      .catch((err: Error) => {
        if (active) setError(err.message || 'Unable to load shipments.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Shipment[]> = {
      CREATED: [],
      IN_TRANSIT: [],
      DELIVERED: [],
      CANCELLED: [],
    };
    for (const s of shipments) {
      if (s.status in map) {
        map[s.status].push(s);
      }
    for (const shipment of shipments) {
      (map[shipment.status] ??= []).push(shipment);
    }
    return map;
  }, [shipments]);

  if (isLoading && shipments.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading shipments…</span>
  const handleLoadMore = (status: string) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [status]: (prev[status] ?? INITIAL_COLUMN_LIMIT) + COLUMN_INCREMENT,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[#94a3b8]" aria-live="polite">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading board…
      </div>
    );
  }

  return (
    <div
      className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4"
      role="region"
      aria-label="Shipments Kanban board"
    >
      {COLUMNS.map(({ status, label }) => (
        <KanbanColumn
          key={status}
          status={status}
          label={label}
          shipments={grouped[status]}
          onCardClick={(id) => navigate(`/dashboard/shipments/${id}`)}
        />
      ))}
  if (error) {
    return <div className="shipments-error">{error}</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:overflow-x-auto pb-2" aria-label="Shipments Kanban board">
      {COLUMNS.map((column) => {
        const columnShipments = grouped[column.status] ?? [];
        const limit = visibleCounts[column.status] ?? INITIAL_COLUMN_LIMIT;
        const visible = columnShipments.slice(0, limit);
        const hasMore = columnShipments.length > limit;

        return (
          <section
            key={column.status}
            className="flex-1 min-w-0 lg:min-w-[280px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3"
            aria-label={`${column.title} column`}
          >
            <header className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.accent}`} />
                <h2 className="text-white font-semibold text-sm">{column.title}</h2>
              </div>
              <span className="text-[11px] text-[#94a3b8] bg-[rgba(255,255,255,0.05)] rounded-full px-2 py-0.5">
                {columnShipments.length}
              </span>
            </header>

            <div className="flex flex-col gap-2 lg:max-h-[600px] lg:overflow-y-auto pr-0.5">
              {visible.length === 0 ? (
                <p className="text-[#64748b] text-xs text-center py-6">No shipments</p>
              ) : (
                visible.map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    onClick={() => navigate(`/dashboard/shipments/${shipment.id}`)}
                  />
                ))
              )}

              {hasMore && (
                <button
                  type="button"
                  onClick={() => handleLoadMore(column.status)}
                  className="mt-1 w-full text-center text-xs text-[#62ffff] hover:bg-[rgba(98,255,255,0.08)] border border-[rgba(98,255,255,0.2)] rounded-lg py-2 transition-colors cursor-pointer"
                >
                  Load more ({columnShipments.length - limit} remaining)
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ShipmentsKanban;
