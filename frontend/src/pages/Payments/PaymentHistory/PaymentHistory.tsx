import React, { useEffect, useMemo, useRef } from "react";
import { ExternalLink, AlertTriangle, X } from "lucide-react";
import PaymentSummaryCards from "../PaymentSummaryCards";
import { usePaymentSummary } from "../PaymentSummaryCards/usePaymentSummary";
import { buildPaymentSummaryCards } from "../PaymentSummaryCards/buildPaymentSummaryCards";
import EmptyState from "@components/ui/EmptyState/EmptyState";
import { useFocusTrap } from "@hooks/useFocusTrap";
import {
  Settlement,
  SettlementDetail,
} from "@services/api/endpoints/settlements";
import { getStellarExpertTxUrl } from "@utils/stellar";
import { usePaymentHistory } from "./usePaymentHistory";
import { truncateHash } from "./paymentUtils";
import PaymentFilters from "./PaymentFilters";
import PaymentTable from "./PaymentTable";
import PaymentMobileList from "./PaymentMobileList";
import PaymentPagination from "./PaymentPagination";

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
          <h2
            id="payment-detail-title"
            className="text-lg font-bold text-[#62ffff]"
          >
            Payment Details
          </h2>
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
              <div
                key={i}
                className="h-5 rounded bg-[rgba(98,255,255,0.1)] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <dl className="flex flex-col gap-3 text-sm">
            {(
              [
                ["Shipment ID", effective.shipmentId],
                [
                  "Date",
                  new Date(effective.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                ],
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
                    href={getStellarExpertTxUrl(effective.stellarTxHash)}
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
              href={getStellarExpertTxUrl(effective.stellarTxHash)}
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

const tableContainerClass =
  "bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden mb-5 shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]";

const PaymentHistory: React.FC = () => {
  const {
    isLoading,
    error,
    filterStatus,
    setFilterStatus,
    sortOrder,
    currentPage,
    setCurrentPage,
    isModalOpen,
    selectedPayment,
    selectedDetail,
    isModalLoading,
    payments,
    total,
    totalPages,
    itemsPerPage,
    reload,
    openPaymentDetail,
    closeModal,
    handleSortToggle,
  } = usePaymentHistory();

  const summary = usePaymentSummary();
  const summaryCards = useMemo(
    () => (summary.data ? buildPaymentSummaryCards(summary.data) : []),
    [summary.data],
  );

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
              reload();
            },
          }}
        />
      </div>
    );
  }

  const isEmpty = !isLoading && payments.length === 0;

  return (
    <div className="p-6 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 max-md:flex-col max-md:gap-4">
        {pageHeader}
        <PaymentFilters
          filterStatus={filterStatus}
          sortOrder={sortOrder}
          onFilterChange={(status) => {
            setFilterStatus(status);
            setCurrentPage(1);
          }}
          onSortToggle={handleSortToggle}
        />
      </div>

      {/* Payment Summary Cards */}
      <PaymentSummaryCards
        cards={summaryCards}
        isLoading={summary.isLoading}
        error={summary.error}
        onRetry={summary.reload}
      />

      {/* No rows: the header controls stay so the filter can be changed back. */}
      {isEmpty && (
        <div className={tableContainerClass}>
          <EmptyState.NoPayments />
        </div>
      )}

      {/* Desktop table — hidden on mobile */}
      {!isEmpty && (
        <PaymentTable
          payments={payments}
          isLoading={isLoading}
          itemsPerPage={itemsPerPage}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
          onRowClick={(payment) => void openPaymentDetail(payment)}
        />
      )}

      {/* Mobile card list — hidden on md+ */}
      {!isEmpty && (
        <PaymentMobileList
          payments={payments}
          isLoading={isLoading}
          onCardClick={(payment) => void openPaymentDetail(payment)}
        />
      )}

      {/* Pagination */}
      {!isEmpty && (
        <PaymentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          onPageChange={setCurrentPage}
          onPrev={() => setCurrentPage(Math.max(1, currentPage - 1))}
          onNext={() =>
            setCurrentPage(Math.min(totalPages, currentPage + 1))
          }
        />
      )}

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
