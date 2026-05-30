import React, { useCallback, useEffect, useState } from 'react';
import {
  ExternalLink,
  Hash,
  Layers,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ledgerApi } from '@services/api/endpoints/ledger';
import type { LedgerBlock, MilestoneEvent, GetLedgerBlocksParams } from '@services/api/endpoints/ledger';

// ─── Constants ────────────────────────────────────────────────────────────────

const STELLAR_EXPERT_TX_BASE = 'https://stellar.expert/explorer/public/tx';
const PAGE_LIMIT = 15;

const MILESTONE_LABELS: Record<MilestoneEvent, string> = {
  SHIPMENT_CREATED: 'Shipment Created',
  PICKUP_CONFIRMED: 'Pickup Confirmed',
  IN_TRANSIT: 'In Transit',
  CUSTOMS_CLEARED: 'Customs Cleared',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  SETTLEMENT_INITIATED: 'Settlement Initiated',
  SETTLEMENT_COMPLETED: 'Settlement Completed',
  PROOF_SUBMITTED: 'Proof Submitted',
};

const MILESTONE_COLORS: Record<MilestoneEvent, { dot: string; badge: string; text: string }> = {
  SHIPMENT_CREATED: { dot: 'bg-blue-400', badge: 'bg-blue-400/10', text: 'text-blue-400' },
  PICKUP_CONFIRMED: { dot: 'bg-cyan-400', badge: 'bg-cyan-400/10', text: 'text-cyan-400' },
  IN_TRANSIT: { dot: 'bg-primary', badge: 'bg-primary/10', text: 'text-primary' },
  CUSTOMS_CLEARED: { dot: 'bg-purple-400', badge: 'bg-purple-400/10', text: 'text-purple-400' },
  OUT_FOR_DELIVERY: { dot: 'bg-orange-400', badge: 'bg-orange-400/10', text: 'text-orange-400' },
  DELIVERED: { dot: 'bg-accent-green', badge: 'bg-accent-green/10', text: 'text-green-400' },
  CANCELLED: { dot: 'bg-accent-red', badge: 'bg-accent-red/10', text: 'text-red-400' },
  SETTLEMENT_INITIATED: { dot: 'bg-yellow-400', badge: 'bg-yellow-400/10', text: 'text-yellow-400' },
  SETTLEMENT_COMPLETED: { dot: 'bg-emerald-400', badge: 'bg-emerald-400/10', text: 'text-emerald-400' },
  PROOF_SUBMITTED: { dot: 'bg-indigo-400', badge: 'bg-indigo-400/10', text: 'text-indigo-400' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageHeader({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Layers size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">
            Blockchain Ledger
          </h1>
        </div>
        <p className="text-sm text-text-secondary pl-[52px]">
          Immutable on-chain milestone history for all shipment events
        </p>
      </div>
      <button
        id="ledger-refresh-btn"
        onClick={onRefresh}
        disabled={refreshing}
        className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(98,255,255,0.2)] text-text-secondary text-sm font-medium transition-all hover:border-primary/50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Refresh ledger data"
      >
        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>
  );
}

function StatsBar({ total, hasMore }: { total?: number; hasMore: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[
        {
          label: 'Total Blocks',
          value: total !== undefined ? total.toLocaleString() : '—',
          icon: <Layers size={16} className="text-primary" />,
        },
        {
          label: 'Network',
          value: 'Stellar Mainnet',
          icon: <Hash size={16} className="text-purple-400" />,
        },
        {
          label: 'Status',
          value: hasMore ? 'Syncing' : 'Up to date',
          icon: hasMore
            ? <Clock size={16} className="text-yellow-400" />
            : <CheckCircle2 size={16} className="text-emerald-400" />,
        },
      ].map(({ label, value, icon }) => (
        <div
          key={label}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.15)]"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background-elevated">
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-text-primary">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface FilterBarProps {
  filter: MilestoneEvent | '';
  onFilterChange: (v: MilestoneEvent | '') => void;
}

function FilterBar({ filter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-text-secondary">
        <Filter size={14} />
        <span className="text-xs font-medium">Filter:</span>
      </div>
      <button
        id="ledger-filter-all"
        onClick={() => onFilterChange('')}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          filter === ''
            ? 'bg-primary/15 text-primary border border-primary/30'
            : 'bg-background-elevated text-text-secondary border border-border hover:border-primary/30 hover:text-text-primary'
        }`}
      >
        All Events
      </button>
      {(Object.keys(MILESTONE_LABELS) as MilestoneEvent[]).map((event) => {
        const colors = MILESTONE_COLORS[event];
        return (
          <button
            key={event}
            id={`ledger-filter-${event.toLowerCase()}`}
            onClick={() => onFilterChange(event)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filter === event
                ? `${colors.badge} ${colors.text} border-current/30`
                : 'bg-background-elevated text-text-secondary border-border hover:border-primary/30 hover:text-text-primary'
            }`}
          >
            {MILESTONE_LABELS[event]}
          </button>
        );
      })}
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4 border-b border-[rgba(98,255,255,0.08)]">
          <div className="h-4 rounded-md bg-[rgba(98,255,255,0.06)] animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonRow key={i} cols={6} />
      ))}
    </>
  );
}

interface LedgerTableProps {
  blocks: LedgerBlock[];
  loading: boolean;
}

function LedgerTable({ blocks, loading }: LedgerTableProps) {
  const thClass =
    'px-5 py-3.5 text-left text-[11px] font-semibold text-[#62ffff] uppercase tracking-widest border-b border-[rgba(98,255,255,0.15)] whitespace-nowrap';
  const tdClass =
    'px-5 py-4 text-sm text-text-primary border-b border-[rgba(98,255,255,0.08)]';

  return (
    <div className="overflow-x-auto rounded-2xl bg-[rgba(19,186,186,0.04)] border border-[rgba(98,255,255,0.15)] shadow-[inset_0_0_30px_0px_rgba(0,128,128,0.12)]">
      <table className="w-full border-collapse min-w-[750px]" aria-label="Blockchain ledger events table">
        <thead className="bg-[rgba(19,186,186,0.08)]">
          <tr>
            <th className={thClass}>Block #</th>
            <th className={thClass}>Timestamp</th>
            <th className={thClass}>Shipment Ref</th>
            <th className={thClass}>Milestone</th>
            <th className={thClass}>Tx Hash</th>
            <th className={thClass}>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableSkeleton />
          ) : (
            blocks.map((block) => {
              const colors = MILESTONE_COLORS[block.milestoneEvent] ?? {
                dot: 'bg-text-secondary',
                badge: 'bg-text-secondary/10',
                text: 'text-text-secondary',
              };
              const label = MILESTONE_LABELS[block.milestoneEvent] ?? block.milestoneEvent;
              const explorerUrl = `${STELLAR_EXPERT_TX_BASE}/${block.transactionHash}`;

              return (
                <tr
                  key={`${block.blockNumber}-${block.transactionHash}`}
                  className="transition-colors hover:bg-[rgba(98,255,255,0.03)] group"
                >
                  {/* Block number */}
                  <td className={tdClass}>
                    <span className="font-mono text-primary font-semibold">
                      #{block.blockNumber.toLocaleString()}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className={`${tdClass} text-text-secondary font-mono text-xs`}>
                    {formatTimestamp(block.timestamp)}
                  </td>

                  {/* Shipment reference */}
                  <td className={tdClass}>
                    <span className="font-medium text-text-primary">
                      {block.shipmentReference}
                    </span>
                  </td>

                  {/* Milestone event */}
                  <td className={tdClass}>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.badge} ${colors.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
                      {label}
                    </span>
                  </td>

                  {/* Tx hash */}
                  <td className={tdClass}>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`tx-link-${block.transactionHash.slice(0, 8)}`}
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-primary/80 hover:text-primary transition-colors group/link"
                      aria-label={`View transaction ${block.transactionHash} on Stellar Expert`}
                      title={block.transactionHash}
                    >
                      {truncateHash(block.transactionHash)}
                      <ExternalLink
                        size={11}
                        className="opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0"
                      />
                    </a>
                  </td>

                  {/* Verification status */}
                  <td className={tdClass}>
                    {block.verified ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 size={13} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-yellow-400 text-xs font-semibold">
                        <Clock size={13} />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function EmptyLedger() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background-elevated border border-border">
        <Layers size={28} className="text-text-secondary" />
      </div>
      <div className="flex flex-col gap-2 max-w-sm">
        <h3 className="text-lg font-semibold text-text-primary">No blocks found</h3>
        <p className="text-sm text-text-secondary">
          No on-chain events match your current filter. Try selecting a different milestone type or clearing the filter.
        </p>
      </div>
    </div>
  );
}

interface PagerProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  pageLabel: string;
  loading: boolean;
}

function CursorPager({ hasPrev, hasNext, onPrev, onNext, pageLabel, loading }: PagerProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 bg-[rgba(19,186,186,0.04)] border border-[rgba(98,255,255,0.15)] rounded-xl">
      <span className="text-sm text-text-secondary">{pageLabel}</span>
      <div className="flex items-center gap-2">
        <button
          id="ledger-prev-page"
          onClick={onPrev}
          disabled={!hasPrev || loading}
          aria-label="Previous page"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(98,255,255,0.2)] text-text-secondary text-sm font-medium transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <button
          id="ledger-next-page"
          onClick={onNext}
          disabled={!hasNext || loading}
          aria-label="Load next page"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(98,255,255,0.2)] text-text-secondary text-sm font-medium transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface PageState {
  cursor: string | null;
  page: number;
}

const BlockchainLedger: React.FC = () => {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<MilestoneEvent | ''>('');

  // Cursor stack: index 0 = first page (no cursor), subsequent = "next" cursors
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]);
  const [pageIndex, setPageIndex] = useState(0);

  const currentCursor = cursorStack[pageIndex] ?? null;

  const fetchBlocks = useCallback(
    async (cursor: string | null, milestoneEvent: MilestoneEvent | '') => {
      setLoading(true);
      setError(null);
      try {
        const params: GetLedgerBlocksParams = { limit: PAGE_LIMIT };
        if (cursor) params.cursor = cursor;
        if (milestoneEvent) params.milestoneEvent = milestoneEvent;

        const result = await ledgerApi.getBlocks(params);
        setBlocks(result.data);
        setHasMore(result.hasMore);
        if (result.total !== undefined) setTotal(result.total);

        // Store the next cursor at cursorStack[pageIndex + 1] if available
        if (result.hasMore && result.nextCursor) {
          setCursorStack((prev) => {
            const next = [...prev];
            next[pageIndex + 1] = result.nextCursor;
            return next;
          });
        }
      } catch {
        setError('Failed to load blockchain ledger data. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [pageIndex],
  );

  // Re-fetch whenever cursor or filter changes
  useEffect(() => {
    void fetchBlocks(currentCursor, filter);
  }, [currentCursor, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (value: MilestoneEvent | '') => {
    setFilter(value);
    // Reset pagination when filter changes
    setCursorStack([null]);
    setPageIndex(0);
  };

  const handleNext = () => {
    if (hasMore) setPageIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (pageIndex > 0) setPageIndex((i) => i - 1);
  };

  const handleRefresh = () => {
    void fetchBlocks(currentCursor, filter);
  };

  const pageLabel = total !== undefined
    ? `Page ${pageIndex + 1} · ${total.toLocaleString()} total blocks`
    : `Page ${pageIndex + 1}`;

  return (
    <main className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <PageHeader onRefresh={handleRefresh} refreshing={loading} />

      {/* Stats bar */}
      <StatsBar total={total} hasMore={hasMore} />

      {/* Filter bar */}
      <div className="overflow-x-auto pb-1">
        <FilterBar filter={filter} onFilterChange={handleFilterChange} />
      </div>

      {/* Error state */}
      {error && !loading && (
        <div
          role="alert"
          id="ledger-error-banner"
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/25 text-red-400 text-sm"
        >
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Error loading ledger</span>
            <span className="text-red-300/80">{error}</span>
          </div>
        </div>
      )}

      {/* Table / empty state */}
      {!error || loading ? (
        <>
          {!loading && blocks.length === 0 ? (
            <div
              id="ledger-empty-state"
              className="rounded-2xl bg-[rgba(19,186,186,0.04)] border border-[rgba(98,255,255,0.15)]"
            >
              <EmptyLedger />
            </div>
          ) : (
            <LedgerTable blocks={blocks} loading={loading} />
          )}

          {/* Cursor pagination */}
          {(hasMore || pageIndex > 0) && (
            <CursorPager
              hasPrev={pageIndex > 0}
              hasNext={hasMore}
              onPrev={handlePrev}
              onNext={handleNext}
              pageLabel={pageLabel}
              loading={loading}
            />
          )}
        </>
      ) : null}
    </main>
  );
};

export default BlockchainLedger;
