import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import TableRowSkeleton from "@components/ui/Skeleton/TableRowSkeleton";
import { Link } from "react-router-dom";
import {
  settlementsApi,
  Settlement,
  SettlementStatus,
  SettlementDetail,
  RevenueSummaryResponse,
} from "@services/api/endpoints/settlements";
import { SettlementDetailModal } from "./components";
import { useRealtimeEvents } from "../../hooks/useRealtimeEvents";
import { can } from "../../utils/rbac";
import { useAuthContext } from "../../context/AuthContext";
import { useLiveRegion } from "../../context/LiveRegionContext";
import Breadcrumb from "@components/common/Breadcrumb";

import { getStellarExpertTxUrl } from "@utils/stellar";
import { formatDate } from "@utils/localeFormat";

// Local lightweight table formatting (kept inline to avoid coupling)
const truncateHash = (hash?: string) => {
  if (!hash) return "-";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
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

const statusDotClasses: Record<SettlementStatus, string> = {
  PENDING: "bg-[#fbbf24]",
  ESCROWED: "bg-[#62ffff]",
  RELEASED: "bg-[#34d399]",
  DISPUTED: "bg-[#f87171]",
  FAILED: "bg-[#f87171]",
};

const toStatusLabel = (s: SettlementStatus) => s;

export default function Settlements() {
  const { t, i18n } = useTranslation("dashboard");
  const { role } = useAuthContext();
  const { announce } = useLiveRegion();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const realtimeEvents = useRealtimeEvents(["settlement:status"]);

  const [filterStatus, setFilterStatus] = useState<SettlementStatus | "ALL">(
    "ALL",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SettlementDetail | null>(
    null,
  );
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Global summary fetched from the backend — not page-scoped.
  const [summary, setSummary] = useState<RevenueSummaryResponse | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Cancel any in-flight request before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

const Settlements: React.FC = () => {
  const { startDate, endDate } = useParams<{ startDate: string; endDate: string }>();
  const [settlements, setSettlements] = useState([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch summary stats from dedicated endpoint
        const summaryResponse = await fetchSettlementSummary(startDate, endDate);
        setSummaryStats(summaryResponse.data);

        // Fetch paginated settlements
        const response = await fetchSettlements(startDate, endDate, page);
        setSettlements(response.data.settlements);
      } catch (error) {
        console.error('Failed to load settlements:', error);
      } finally {
        setLoading(false);
      }
    };
  }, [load]);

  // The summary is aggregated server-side, independent of pagination, so it
  // reflects all settlements rather than the rows on the current page. Only
  // the latest request may write the result, so a slow earlier response can
  // never overwrite a newer one.
  const summaryRequestRef = useRef(0);
  const loadSummary = useCallback(() => {
    const requestId = ++summaryRequestRef.current;
    settlementsApi
      .getSummary()
      .then((res) => {
        if (requestId === summaryRequestRef.current) setSummary(res);
      })
      .catch(() => {
        // Non-critical — summary cards keep their last value (or a placeholder)
      });
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Apply realtime settlement status updates
  useEffect(() => {
    const event = realtimeEvents["settlement:status"];
    if (!event) return;
    Promise.resolve().then(() => {
      setSettlements((prev) =>
        prev.map((s) =>
          s._id === event.settlementId
            ? {
                ...s,
                status: event.newStatus,
                stellarTxHash: event.txHash ?? s.stellarTxHash,
              }
            : s,
        ),
      );
      const isError =
        event.newStatus === "FAILED" || event.newStatus === "DISPUTED";
      announce(
        `Settlement status updated to ${event.newStatus}`,
        isError ? "assertive" : "polite",
      );
      // A status change moves money between buckets — refresh the totals so
      // the cards stay consistent with the table.
      loadSummary();
    });
  }, [realtimeEvents, announce, loadSummary]);

    loadData();
  }, [startDate, endDate, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const tableContainerClass =
    "bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden mb-5 shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]";
  const thClass =
    "text-left px-6 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]";
  const tdClass = "px-6 py-4 text-sm border-b border-[rgba(98,255,255,0.2)]";

  if (error) {
    return (
      <div className="p-6 md:p-4">
        <EmptyState
          icon={<AlertTriangle size={28} />}
          title={t("settlements.error.title")}
          description={error}
          cta={{
            label: t("settlements.error.retry"),
            onClick: () => {
              setCurrentPage(1);
              void load();
              loadSummary();
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="settlements-container">
      <h1>Settlements Summary</h1>

      <div className="summary-cards">
        {summaryStats && (
          <>
            <SummaryCard
              title="Total Revenue"
              value={formatCurrency(summaryStats.totalRevenue)}
              icon="currency"
            />
            <SummaryCard
              title="Dispute Count"
              value={summaryStats.disputeCount}
              icon="alert"
            />
            <SummaryCard
              title="Total Settlements"
              value={summaryStats.settlementCount}
              icon="document"
            />
          </>
        )}
      </div>

      <div className="settlements-table">
        {settlements.map((settlement) => (
          <SettlementCard key={settlement.id} {...settlement} />
        ))}
      </div>

      <div className="pagination">
        {/* Pagination controls */}
      </div>
    </div>
  );
};

export default Settlements;