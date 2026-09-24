import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { getStellarExpertTxUrl } from "@utils/stellar";

const statusClasses: Record<SettlementStatus, string> = {
  PENDING:
    "bg-warning/15 text-warning border border-warning/30",
  ESCROWED:
    "bg-primary/15 text-primary border border-primary/30",
  RELEASED:
    "bg-success/15 text-success border border-success/30",
  DISPUTED:
    "bg-error/15 text-error border border-error/30",
  FAILED:
    "bg-error/15 text-error border border-error/30",
};

const statusDotClasses: Record<SettlementStatus, string> = {
  PENDING: "bg-warning",
  ESCROWED: "bg-primary",
  RELEASED: "bg-success",
  DISPUTED: "bg-error",
  FAILED: "bg-error",
};
const truncateHash = (hash?: string) => {
  if (!hash) return "-";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};
import { getStellarExpertTxUrl } from "@utils/stellar";

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
        className="bg-background-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="payment-detail-title" className="text-lg font-bold text-primary">Payment Details</h2>
          <button
            onClick={onClose}
            aria-label="Close payment details"
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-md focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={20} />
          </button>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 rounded bg-primary/10 animate-pulse" />
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
                <dd className="text-text-primary font-medium break-all text-right">
                  {value}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Tx Hash</dt>
              <dd className="text-right">
                {effective.stellarTxHash ? (
                  <a
                    href={getStellarExpertTxUrl(effective.stellarTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-primary inline-flex items-center gap-1 hover:underline"
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
            className="flex-1 px-3 py-2 rounded-lg border border-border text-text-primary hover:border-primary hover:text-primary text-sm transition-colors"
          >
            Close
          </button>
          {effective.stellarTxHash && (
            <a
              href={getStellarExpertTxUrl(effective.stellarTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 rounded-lg bg-primary text-background text-center text-sm font-semibold hover:bg-primary/90 transition-colors"
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

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Cancel any in-flight request before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const res = await settlementsApi.getSettlements(
        {
          page: currentPage,
          limit: itemsPerPage,
          status: filterStatus === "All" ? undefined : filterStatus,
          sortBy: "createdAt",
          sortOrder,
        },
        { signal: controller.signal },
      );
      if (!controller.signal.aborted) {
        setPayments(res.data);
        setTotal(res.total);
      }
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Failed to load payment history");
      setPayments([]);
      setTotal(0);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [currentPage, filterStatus, itemsPerPage, sortOrder]);

  useEffect(() => {
    void load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  const openPaymentDetail = async (payment: Settlement) => {
    setSelectedPayment(payment);
    setSelectedDetail(null);
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const detail = await settlementsApi.getSettlementById(payment._id);
      setSelectedDetail(detail);
    } catch {
      setSelectedDetail(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setSelectedDetail(null);
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  };

  const handleFilterChange = (status: SettlementStatus | "All") => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // Single page-level heading shared by every render state (error / empty /
  // loaded) so the page always exposes just one top-level heading.
  const pageHeader = (
    <div>
      <h1 className="text-2xl font-bold mb-1 max-md:text-xl max-md:font-semibold">
        Payment History
      </h1>
      <p className="text-text-secondary text-sm max-md:text-xs">
        Track all payment transactions on the blockchain
      </p>
    </div>
  );

  const tableContainerClass =
    "bg-background-card border border-border rounded-2xl overflow-hidden mb-5";

  if (error) {
    return (
      <div className="p-6 md:p-4">
        <div className="mb-6">{pageHeader}</div>
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

  return (
    <div className="p-6 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 max-md:flex-col max-md:gap-4">
        {pageHeader}
        <div className="flex gap-3 max-md:w-full max-md:flex-col max-md:gap-2">
          <div className="relative flex items-center max-md:w-full">
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value as SettlementStatus | "All")}
              aria-label="Filter by payment status"
              className="appearance-none bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary px-3.5 py-2 pr-9 rounded-lg text-sm font-medium cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#62ffff] focus-visible:ring-offset-1 focus-visible:ring-offset-background hover:border-[#62ffff] hover:bg-[rgba(19,186,186,0.15)] transition-colors max-md:w-full"
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
            className="inline-flex items-center gap-2 bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#62ffff] focus-visible:ring-offset-1 focus-visible:ring-offset-background hover:border-[#62ffff] hover:bg-[rgba(19,186,186,0.15)] transition-colors max-md:w-full max-md:justify-center"
            onClick={handleSortToggle}
            aria-label={`Sort by date ${sortOrder === "desc" ? "newest first" : "oldest first"}`}
            aria-pressed={sortOrder === "desc"}
          >
            Date <ArrowUpDown size={14} />
            <span className="text-text-secondary max-md:hidden">
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </span>
          </button>
        </div>
      </div>

      <PaymentSummaryCards />

      <div className={tableContainerClass}>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[...Array(5)].map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No payments found"
              description="Your escrow settlements will appear here once created."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-border">
                  <th className="py-3 px-4 font-medium">Shipment</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Tx Hash</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-border last:border-0 hover:bg-background-hover transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/dashboard/shipments/${payment.shipmentId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {payment.shipmentId}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {new Date(payment.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-text-primary font-medium">
                      {payment.amount.toLocaleString()} {payment.token}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses[payment.status]}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusDotClasses[payment.status]}`}
                        />
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.stellarTxHash ? (
                        <a
                          href={getStellarExplorerUrl(payment.stellarTxHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-primary inline-flex items-center gap-1 hover:underline"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses[payment.status]}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusDotClasses[payment.status]}`}
                          />
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {payment.stellarTxHash ? (
                          <a
                            href={getStellarExpertTxUrl(payment.stellarTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-primary inline-flex items-center gap-1 hover:underline"
                          >
                            {truncateHash(payment.stellarTxHash)}
                            <ExternalLink size={11} aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-text-secondary text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => openPaymentDetail(payment)}
                          className="text-xs text-primary hover:underline"
                        >
                          {truncateHash(payment.stellarTxHash)}
                          <ExternalLink size={11} aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="text-text-secondary text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => void openPaymentDetail(payment)}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && payments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-text-secondary">
              Page {currentPage} of {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <PaymentDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        settlement={selectedPayment}
        detail={selectedDetail}
        isLoading={isModalLoading}
      />
    </div>
  );
};

export default PaymentHistory;
