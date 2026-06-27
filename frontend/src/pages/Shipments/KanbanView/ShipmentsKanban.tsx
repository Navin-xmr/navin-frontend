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
      CREATED: [],
      IN_TRANSIT: [],
      DELIVERED: [],
      CANCELLED: [],
    };
    for (const s of shipments) {
      if (s.status in map) {
        map[s.status].push(s);
      }
    }
    return map;
  }, [shipments]);

  if (isLoading && shipments.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading shipments…</span>
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
    </div>
  );
};

export default ShipmentsKanban;
