import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { MOCK_SHIPMENTS, type Shipment } from './mockShipments';

type SortKey = 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

interface RecentShipmentsProps {
  shipments?: Shipment[];
  loadingDelayMs?: number;
}

const PAGE_SIZE = 5;

const statusRank: Record<Shipment['status'], number> = {
  'Pending Approval': 1,
  'In Transit': 2,
  Delivered: 3,
  Cancelled: 4,
};

const formatCreatedDate = (createdAt: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(createdAt));

const statusClasses: Record<Shipment['status'], string> = {
  'Pending Approval': 'bg-[rgba(245,158,11,0.1)] text-[#fbbf24]',
  'In Transit':       'bg-[rgba(59,130,246,0.1)] text-[#60a5fa]',
  Delivered:          'bg-[rgba(16,185,129,0.1)] text-[#34d399]',
  Cancelled:          'bg-[rgba(239,68,68,0.1)] text-[#f87171]',
};

const RecentShipments: React.FC<RecentShipmentsProps> = ({
  shipments = MOCK_SHIPMENTS,
  loadingDelayMs = 500,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedShipments, setLoadedShipments] = useState<Shipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const timer = window.setTimeout(() => { setLoadedShipments(shipments); setIsLoading(false); }, loadingDelayMs);
    return () => window.clearTimeout(timer);
  }, [shipments, loadingDelayMs]);

  const sortedShipments = useMemo(() => {
    const sorted = [...loadedShipments].sort((a, b) =>
      sortKey === 'createdAt'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : statusRank[a.status] - statusRank[b.status]
    );
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [loadedShipments, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedShipments.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const currentRows = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return sortedShipments.slice(start, start + PAGE_SIZE);
  }, [activePage, sortedShipments]);

  const handleSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) { setCurrentPage(1); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); return; }
    setCurrentPage(1); setSortKey(nextKey); setSortDirection('asc');
  };

  if (isLoading) {
    return (
      <div className="px-6 pt-4 pb-6" aria-label="Recent shipments loading">
        {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-[repeat(6,minmax(90px,1fr))] gap-3 py-3.5 border-b border-border last:border-b-0">
            {Array.from({ length: 6 }).map((__, i) => (
              <span key={i} className="h-3.5 rounded-full animate-shimmer" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (sortedShipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <h3 className="text-lg font-semibold">No shipments found</h3>
        <p className="text-text-secondary text-sm max-w-[420px]">Start by creating your first shipment to track your delivery pipeline.</p>
        <button type="button" className="mt-2 bg-accent-blue text-white border-none rounded-lg px-3.5 py-2 text-[13px] font-semibold cursor-pointer">
          Create your first shipment
        </button>
      </div>
    );
  }

  const thBase = "text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wide border-b border-border";
  const tdBase = "px-6 py-4 text-sm border-b border-border";

  return (
    <>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thBase}>Shipment ID</th>
            <th className={thBase}>Origin</th>
            <th className={thBase}>Destination</th>
            <th className={thBase}>
              <button
                type="button"
                className="border-none bg-transparent text-inherit inline-flex items-center gap-1.5 font-[inherit] text-inherit uppercase cursor-pointer p-0 hover:text-text-primary transition-colors"
                onClick={() => handleSort('status')}
                aria-label={`Sort by status (${sortDirection})`}
              >
                Status <ChevronsUpDown size={14} />
              </button>
            </th>
            <th className={thBase}>
              <button
                type="button"
                className="border-none bg-transparent text-inherit inline-flex items-center gap-1.5 font-[inherit] text-inherit uppercase cursor-pointer p-0 hover:text-text-primary transition-colors"
                onClick={() => handleSort('createdAt')}
                aria-label={`Sort by created date (${sortDirection})`}
              >
                Created Date <ChevronsUpDown size={14} />
              </button>
            </th>
            <th className={thBase}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map(shipment => (
            <tr key={shipment.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              <td className={`${tdBase} font-medium text-text-primary`}>{shipment.id}</td>
              <td className={tdBase}>{shipment.origin}</td>
              <td className={tdBase}>{shipment.destination}</td>
              <td className={tdBase}>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses[shipment.status]}`}>
                  {shipment.status}
                </span>
              </td>
              <td className={tdBase}>{formatCreatedDate(shipment.createdAt)}</td>
              <td className={tdBase}>
                <button type="button" className="bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-accent-blue hover:text-white transition-all">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="border-t border-border flex items-center justify-between px-6 py-3.5 gap-3 flex-wrap md:justify-center" aria-label="Recent shipments pagination">
        <button
          type="button"
          className="border border-border bg-background-elevated text-[#d1d5db] rounded-lg cursor-pointer text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-1.5 disabled:opacity-45 disabled:cursor-not-allowed transition-colors hover:not-disabled:bg-[#1a2030]"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={activePage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                type="button"
                className={`border rounded-lg cursor-pointer text-xs font-semibold min-w-[32px] px-2.5 py-1.5 transition-colors ${
                  page === activePage
                    ? 'bg-accent-blue border-accent-blue text-white'
                    : 'border-border bg-background-elevated text-[#d1d5db] hover:bg-[#1a2030]'
                }`}
                onClick={() => setCurrentPage(page)}
                aria-label={`Page ${page}`}
                aria-current={page === activePage ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="border border-border bg-background-elevated text-[#d1d5db] rounded-lg cursor-pointer text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-1.5 disabled:opacity-45 disabled:cursor-not-allowed transition-colors hover:not-disabled:bg-[#1a2030]"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={activePage === totalPages}
          aria-label="Next page"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </>
  );
};

export default RecentShipments;
