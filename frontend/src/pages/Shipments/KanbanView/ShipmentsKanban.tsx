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
    for (const shipment of shipments) {
      (map[shipment.status] ??= []).push(shipment);
    }
    return map;
  }, [shipments]);

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
