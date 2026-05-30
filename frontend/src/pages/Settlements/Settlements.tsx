import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  settlementsApi,
  Settlement,
  SettlementStatus,
  SettlementDetail,
} from "@services/api/endpoints/settlements";
import { PaymentDetailModal } from "./components";


// Local lightweight table formatting (kept inline to avoid coupling)
const truncateHash = (hash?: string) => {
  if (!hash) return "-";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

const getStellarExplorerUrl = (hash?: string) => {
  if (!hash) return undefined;
  return `https://stellar.expert/explorer/public/tx/${hash}`;
};

const statusClasses: Record<SettlementStatus, string> = {
  PENDING:
    "bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.3)]",
  ESCROWED:
    "bg-[rgba(98,255,255,0.15)] text-[#62ffff] border border-[rgba(98,255,255,0.3)]",
  RELEASED:
    "bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.3)]",
  DISPUTED:
    "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]",
  FAILED:
    "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]",
};

const toStatusLabel = (s: SettlementStatus) => s;

const LoadingState: React.FC = () => (
  <div className="p-6 md:p-4">
    <div className="flex items-center gap-3 text-text-secondary">
      <Loader2 className="animate-spin" size={18} />
      Loading settlements...
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="p-6 md:p-4">
    <div className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl px-10 py-20 text-center">
      <div className="text-[64px] mb-4">🧾</div>
      <h2 className="text-xl font-bold mb-2 text-[#62ffff]">No Settlements Found</h2>
      <p className="text-text-secondary text-sm">No settlement records match your criteria.</p>
    </div>
  </div>
);

export default function Settlements() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<SettlementStatus | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SettlementDetail | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await settlementsApi.getSettlements({
        page: currentPage,
        limit,
        status: filterStatus === "ALL" ? undefined : filterStatus,
        sortBy: "createdAt",
        sortOrder,
      });
      setSettlements(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settlements");
      setSettlements([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterStatus, sortOrder]);

  const summary = useMemo(() => {
    // Aggregate from current page (fallback). If backend summary is desired, extend endpoint.
    const totalSettledAmount = settlements
      .filter((s) => s.status === "RELEASED")
      .reduce((sum, s) => sum + (s.amount ?? 0), 0);

    const pendingCount = settlements.filter((s) => s.status === "PENDING").length;
    const disputedCount = settlements.filter((s) => s.status === "DISPUTED").length;

    return {
      totalSettledAmount,
      pendingCount,
      disputedCount,
    };
  }, [settlements]);

  const onOpen = async (s: Settlement) => {
    setSelected(s);
    setSelectedDetail(null);
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const detail = await settlementsApi.getSettlementById(s._id);
      setSelectedDetail(detail);
    } catch {
      // Keep modal open with list info
    } finally {
      setIsModalLoading(false);
    }
  };

  const tableContainerClass =
    "bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden mb-5 shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]";
  const thClass =
    "text-left px-6 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]";
  const tdClass = "px-6 py-4 text-sm border-b border-[rgba(98,255,255,0.2)]";

  if (isLoading) return <LoadingState />;
  if (error) {
    return (
      <div className="p-6 md:p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <div className="text-red-200 font-semibold mb-2">Error</div>
          <div className="text-text-secondary text-sm mb-4">{error}</div>
          <button
            onClick={() => {
              setCurrentPage(1);
              void load();
            }}
            className="px-4 py-2 rounded-lg border border-[rgba(98,255,255,0.2)] text-text-primary hover:border-[#62ffff] hover:text-[#62ffff]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 max-md:text-xl max-md:font-semibold">Settlements</h1>
          <p className="text-text-secondary text-sm max-md:text-xs">
            Track escrow releases and settlement outcomes
          </p>
        </div>

        <div className="flex gap-3 max-md:w-full max-md:flex-col max-md:gap-2">
          <div className="relative flex items-center max-md:w-full">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as SettlementStatus | "ALL");
                setCurrentPage(1);
              }}
              className="appearance-none bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary px-3.5 py-2 pr-9 rounded-lg text-sm font-medium cursor-pointer outline-none hover:border-[#62ffff] hover:bg-[rgba(19,186,186,0.15)] transition-colors max-md:w-full"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="ESCROWED">ESCROWED</option>
              <option value="RELEASED">RELEASED</option>
              <option value="DISPUTED">DISPUTED</option>
              <option value="FAILED">FAILED</option>
            </select>
            <ArrowUpDown
              size={16}
              className="absolute right-3 pointer-events-none text-text-secondary rotate-90"
            />
          </div>
          <span
            className="inline-flex items-center gap-2 appearance-none bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary px-3.5 py-2 pr-9 rounded-lg text-sm font-medium cursor-pointer outline-none hover:border-[#62ffff] hover:bg-[rgba(19,186,186,0.15)] transition-colors max-md:w-full max-md:justify-center"
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
          >
            Date <ArrowUpDown size={14} />
            <span className="text-text-secondary max-md:hidden">
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </span>
          </span>
        </div>
      </div>

      {/* Summary cards (simple; designed to be replaced with PaymentSummaryCards integration) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative bg-background-card border border-border rounded-2xl p-5 overflow-hidden after:absolute after:top-0 after:right-0 after:w-24 after:h-24 after:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] after:pointer-events-none">
          <div className="text-text-secondary text-xs font-semibold uppercase mb-2">Total settled</div>
          <div className="text-[32px] font-bold leading-none max-md:text-2xl">
            {summary.totalSettledAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="relative bg-background-card border border-border rounded-2xl p-5 overflow-hidden after:absolute after:top-0 after:right-0 after:w-24 after:h-24 after:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] after:pointer-events-none">
          <div className="text-text-secondary text-xs font-semibold uppercase mb-2">Pending</div>
          <div className="text-[32px] font-bold leading-none max-md:text-2xl">{summary.pendingCount}</div>
        </div>
        <div className="relative bg-background-card border border-border rounded-2xl p-5 overflow-hidden after:absolute after:top-0 after:right-0 after:w-24 after:h-24 after:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] after:pointer-events-none">
          <div className="text-text-secondary text-xs font-semibold uppercase mb-2">Disputed</div>
          <div className="text-[32px] font-bold leading-none max-md:text-2xl">{summary.disputedCount}</div>
        </div>
        <div className="relative bg-background-card border border-border rounded-2xl p-5 overflow-hidden after:absolute after:top-0 after:right-0 after:w-24 after:h-24 after:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] after:pointer-events-none">
          <div className="text-text-secondary text-xs font-semibold uppercase mb-2">Total records</div>
          <div className="text-[32px] font-bold leading-none max-md:text-2xl">{total}</div>
        </div>
      </div>

      {settlements.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className={`${tableContainerClass} md:overflow-x-auto`}>
            <table className="w-full border-collapse md:min-w-200">
              <thead className="bg-[rgba(19,186,186,0.1)]">
                <tr>
                  <th
                    className={`${thClass} cursor-pointer select-none`}
                    onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                  >
                    <span className="inline-flex items-center gap-2">Date <ArrowUpDown size={14} /></span>
                  </th>
                  <th className={thClass}>Shipment ID</th>
                  <th className={thClass}>Amount</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Stellar Tx</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => {
                  const url = getStellarExplorerUrl(s.stellarTxHash);
                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-[rgba(98,255,255,0.05)] transition-colors last:border-b-0 cursor-pointer"
                      onClick={() => void onOpen(s)}
                    >
                      <td className={`${tdClass} font-medium text-text-secondary`}>
                        {new Date(s.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className={tdClass}>
                        <Link
                          to={`/dashboard/shipments/${s.shipmentId}`}
                          className="text-[#62ffff] font-semibold no-underline hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {s.shipmentId}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-sm">{s.amount.toLocaleString()}</span>
                          <span className="text-[11px] text-text-secondary uppercase">{s.token}</span>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase inline-block ${statusClasses[s.status]}`}
                        >
                          {toStatusLabel(s.status)}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-text-secondary no-underline flex items-center gap-1.5 transition-colors hover:text-[#62ffff]"
                          >
                            {truncateHash(s.stellarTxHash)}
                            <ExternalLink size={12} className="text-[#62ffff]" />
                          </a>
                        ) : (
                          <span className="text-text-secondary">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-6 py-4 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-xl shadow-[inset_0_0_15px_0px_rgba(0,128,128,0.2)] md:flex-col md:gap-4">
            <div className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2 md:w-full md:justify-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-9 transition-all hover:not-disabled:bg-[rgba(98,255,255,0.1)] hover:not-disabled:border-[#62ffff] hover:not-disabled:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`border px-3 py-2 rounded-md text-sm font-semibold cursor-pointer min-w-9 transition-all ${currentPage === i + 1
                    ? "bg-[#62ffff] border-[#62ffff] text-black"
                    : "bg-transparent border-[rgba(98,255,255,0.2)] text-text-primary hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff]"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-9 transition-all hover:not-disabled:bg-[rgba(98,255,255,0.1)] hover:not-disabled:border-[#62ffff] hover:not-disabled:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <PaymentDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            settlement={selected}
            detail={selectedDetail}
            isLoading={isModalLoading}
          />
        </>
      )}
    </div>
  );
}

