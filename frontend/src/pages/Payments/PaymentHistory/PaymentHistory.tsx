import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowUpDown,
  AlertTriangle,
  X,
} from "lucide-react";
import PaymentSummaryCards from "../PaymentSummaryCards";
import EmptyState from "@components/ui/EmptyState/EmptyState";
import TableRowSkeleton from "@components/ui/Skeleton/TableRowSkeleton";
import { useFocusTrap } from "@hooks/useFocusTrap";
import {
  settlementsApi,
  Settlement,
  SettlementStatus,
  SettlementDetail,
} from "@services/api/endpoints/settlements";

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

const truncateHash = (hash?: string) => {
  if (!hash) return "-";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

const getStellarExplorerUrl = (hash?: string) => {
  if (!hash) return undefined;
  return `https://stellar.expert/explorer/public/tx/${hash}`;
};

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: Settlement | null;
  detail: SettlementDetail | null;
  isLoading?: boolean;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  isOpen,
  onClose,
  settlement,
  detail,
  isLoading,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen, onClose);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const effective = detail?.settlement ?? settlement;
  if (!effective) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-detail-title"
        className="bg-[rgba(8,40,50,0.95)] border border-[rgba(98,255,255,0.2)] rounded-2xl p-6 w-full max-w-md shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="payment-detail-title" className="text-lg font-bold text-[#62ffff]">Payment Details</h2>
          <button
            onClick={onClose}
            aria-label="Close payment details"
            className="text-text-secondary hover:text-white transition-colors p-1 rounded-md focus-visible:outline-2 focus-visible:outline-[#62ffff]"
          >
            <X size={20} />
          </button>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 rounded bg-[rgba(98,255,255,0.1)] animate-pulse" />
            ))}
          </div>
        ) : (
          <dl className="flex flex-col gap-3 text-sm">
            {(
              [
                ["Shipment ID", effective.shipmentId],
                ["Date", new Date(effective.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })],
                [
                  "Amount",
                  `${effective.amount.toLocaleString()} ${effective.token}`,
                ],
                ["Status", effective.status],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-text-secondary">{label}</dt>
                <dd className="text-white font-medium break-all text-right">
                  {value}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Tx Hash</dt>
              <dd className="text-right">
                {effective.stellarTxHash ? (
                  <a
                    href={getStellarExplorerUrl(effective.stellarTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#62ffff] inline-flex items-center gap-1 hover:underline"
                  >
                    {truncateHash(effective.stellarTxHash)}
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-text-secondary text-xs">-</span>
                )}
              </dd>
            </div>
          </dl>
        )}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg border border-[rgba(98,255,255,0.2)] text-text-primary hover:border-[#62ffff] hover:text-[#62ffff] text-sm transition-colors"
          >
            Close
          </button>
          {effective.stellarTxHash && (
            <a
              href={getStellarExplorerUrl(effective.stellarTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 rounded-lg bg-[#00d4c8] text-black text-center text-sm font-semibold hover:bg-[#13baba] transition-colors"
            >
              Verify on Chain
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentHistory: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<SettlementStatus | "All">(
    "All",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Settlement | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SettlementDetail | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const itemsPerPage = 10;

  const [payments, setPayments] = useState<Settlement[]>([]);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await settlementsApi.getSettlements({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus === "All" ? undefined : filterStatus,
        sortBy: "createdAt",
        sortOrder,
      });
      setPayments(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payment history");
      setPayments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      void load();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterStatus, sortOrder]);

  const openPaymentDetail = async (payment: Settlement) => {
    setSelectedPayment(payment);
    setSelectedDetail(null);
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const detail = await settlementsApi.getSettlementById(payment._id);
      setSelectedDetail(detail);
    } catch {
      // Keep modal open with the list-row data already shown
    } finally {
      setIsModalLoading(false);
    }
  };

  const tableContainerClass =
    "bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden mb-5 shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]";
  const thClass =
    "text-left px-6 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]";
  const tdClass = "px-6 py-4 text-sm border-b border-[rgba(98,255,255,0.2)]";

  if (error) {
    return (
      <div className="p-6 md:p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Payment History</h1>
          <p className="text-text-secondary text-sm">
            Track all payment transactions on the blockchain
          </p>
        </div>
        <EmptyState
          icon={<AlertTriangle size={28} />}
          title="Failed to load payment history"
          description={error}
          action={{
            label: "Retry",
            onClick: () => {
              setCurrentPage(1);
              void load();
            },
          }}
        />
      </div>
    );
  }

  if (!isLoading && payments.length === 0) {
    return (
      <div className="p-6 md:p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Payment History</h1>
          <p className="text-text-secondary text-sm">
            Track all payment transactions on the blockchain
          </p>
        </div>
        <div className={tableContainerClass}>
          <EmptyState.NoPayments />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 max-md:text-xl max-md:font-semibold">
            Payment History
          </h1>
          <p className="text-text-secondary text-sm max-md:text-xs">
            Track all payment transactions on the blockchain
          </p>
        </div>
        <div className="flex gap-3 max-md:w-full max-md:flex-col max-md:gap-2">
          <div className="relative flex items-center max-md:w-full">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as SettlementStatus | "All");
                setCurrentPage(1);
              }}
              aria-label="Filter by payment status"
              className="appearance-none bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary px-3.5 py-2 pr-9 rounded-lg text-sm font-medium cursor-pointer outline-none hover:border-[#62ffff] hover:bg-[rgba(19,186,186,0.15)] transition-colors max-md:w-full"
            >
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ESCROWED">Escrowed</option>
              <option value="RELEASED">Released</option>
              <option value="DISPUTED">Disputed</option>
              <option value="FAILED">Failed</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 pointer-events-none text-text-secondary"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer outline-none hover:border-[#62ffff] hover:bg-[rgba(19,186,186,0.15)] transition-colors max-md:w-full max-md:justify-center"
            onClick={() =>
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            aria-label={`Sort by date ${sortOrder === "desc" ? "newest first" : "oldest first"}`}
            aria-pressed={sortOrder === "desc"}
          >
            Date
            <ArrowUpDown size={14} aria-hidden="true" />
            <span className="text-text-secondary max-md:hidden">
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </span>
          </button>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <PaymentSummaryCards />

      {/* Desktop table — hidden on mobile */}
      <div className={`${tableContainerClass} hidden md:block overflow-x-auto`}>
        <table className="w-full border-collapse min-w-[700px]">
          <thead className="bg-[rgba(19,186,186,0.1)]">
            <tr>
              <th
                className={`${thClass} cursor-pointer select-none`}
                onClick={() =>
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                }
                aria-sort={sortOrder === "desc" ? "descending" : "ascending"}
              >
                <span className="inline-flex items-center gap-2">
                  Date <ArrowUpDown size={14} aria-hidden="true" />
                </span>
              </th>
              <th className={thClass}>Shipment ID</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Transaction Hash</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRowSkeleton count={itemsPerPage} />
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment._id}
                  className="hover:bg-[rgba(98,255,255,0.05)] transition-colors last:border-b-0 cursor-pointer"
                  onClick={() => void openPaymentDetail(payment)}
                >
                  <td className={`${tdClass} font-medium text-text-secondary`}>
                    {new Date(payment.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className={tdClass}>
                    <Link
                      to={`/dashboard/shipments/${payment.shipmentId}`}
                      className="text-[#62ffff] font-semibold no-underline hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {payment.shipmentId}
                    </Link>
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">
                        {payment.amount.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-text-secondary uppercase">
                        {payment.token}
                      </span>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase inline-block ${statusClasses[payment.status]}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className={`${tdClass} font-mono text-xs`}>
                    {payment.stellarTxHash ? (
                      <a
                        href={getStellarExplorerUrl(payment.stellarTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-text-secondary no-underline inline-flex items-center gap-1.5 transition-colors hover:text-[#62ffff]"
                      >
                        {truncateHash(payment.stellarTxHash)}
                        <ExternalLink size={12} className="text-[#62ffff]" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — hidden on md+ */}
      <div className="md:hidden flex flex-col gap-3 mb-5">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-[rgba(98,255,255,0.05)] border border-[rgba(98,255,255,0.2)] animate-pulse"
              />
            ))
          : payments.map((payment) => (
              <button
                key={payment._id}
                type="button"
                onClick={() => void openPaymentDetail(payment)}
                className="w-full text-left bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl p-4 shadow-[inset_0_0_15px_0px_rgba(0,128,128,0.2)] transition-all active:bg-[rgba(19,186,186,0.1)] focus-visible:outline-2 focus-visible:outline-[#62ffff]"
              >
                {/* Top row: status badge + date */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${statusClasses[payment.status]}`}
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${statusDotClasses[payment.status]}`}
                      aria-hidden="true"
                    />
                    {payment.status}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {new Date(payment.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Middle row: shipment ID + amount */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[11px] text-text-secondary uppercase tracking-wide mb-0.5">
                      Shipment
                    </p>
                    <Link
                      to={`/dashboard/shipments/${payment.shipmentId}`}
                      className="text-[#62ffff] font-semibold text-sm no-underline hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {payment.shipmentId}
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-text-secondary uppercase tracking-wide mb-0.5">
                      Amount
                    </p>
                    <p className="font-semibold text-sm text-white">
                      {payment.amount.toLocaleString()}{" "}
                      <span className="text-[11px] text-text-secondary font-normal uppercase">
                        {payment.token}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Bottom row: tx hash */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[rgba(98,255,255,0.1)]">
                  <span className="text-[11px] text-text-secondary">Tx Hash</span>
                  {payment.stellarTxHash ? (
                    <a
                      href={getStellarExplorerUrl(payment.stellarTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs text-text-secondary inline-flex items-center gap-1 hover:text-[#62ffff] transition-colors"
                    >
                      {truncateHash(payment.stellarTxHash)}
                      <ExternalLink size={11} className="text-[#62ffff]" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-text-secondary">-</span>
                  )}
                </div>
              </button>
            ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-6 py-4 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-xl shadow-[inset_0_0_15px_0px_rgba(0,128,128,0.2)] max-md:flex-col max-md:gap-4">
        <div className="text-sm text-text-secondary">
          Page {currentPage} of {totalPages} &middot; {total} total
        </div>
        <div className="flex gap-2 max-md:w-full max-md:justify-center flex-wrap">
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
              className={`border px-3 py-2 rounded-md text-sm font-semibold cursor-pointer min-w-9 transition-all ${
                currentPage === i + 1
                  ? "bg-[#62ffff] border-[#62ffff] text-black"
                  : "bg-transparent border-[rgba(98,255,255,0.2)] text-text-primary hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff]"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
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
        settlement={selectedPayment}
        detail={selectedDetail}
        isLoading={isModalLoading}
      />
    </div>
  );
};

export default PaymentHistory;
