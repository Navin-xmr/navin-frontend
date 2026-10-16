import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowUpDown } from "lucide-react";
import TableRowSkeleton from "@components/ui/Skeleton/TableRowSkeleton";
import { Settlement } from "@services/api/endpoints/settlements";
import { getStellarExpertTxUrl } from "@utils/stellar";
import { statusClasses, truncateHash } from "../paymentUtils";

export interface PaymentTableProps {
  payments: Settlement[];
  isLoading: boolean;
  itemsPerPage: number;
  sortOrder: "asc" | "desc";
  onSortToggle: () => void;
  onRowClick: (payment: Settlement) => void;
}

const tableContainerClass =
  "bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden mb-5 shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]";
const thClass =
  "text-left px-6 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]";
const tdClass = "px-6 py-4 text-sm border-b border-[rgba(98,255,255,0.2)]";

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  isLoading,
  itemsPerPage,
  sortOrder,
  onSortToggle,
  onRowClick,
}) => {
  return (
    <div className={`${tableContainerClass} overflow-x-auto hidden md:block`}>
      <table className="w-full border-collapse min-w-[700px]">
        <thead className="bg-[rgba(19,186,186,0.1)]">
          <tr>
            <th
              className={`${thClass} cursor-pointer select-none`}
              onClick={onSortToggle}
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
            <th className={`${thClass} text-right`}>Actions</th>
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
                onClick={() => onRowClick(payment)}
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
                      href={getStellarExpertTxUrl(payment.stellarTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-text-secondary no-underline inline-flex items-center gap-1.5 transition-colors hover:text-[#62ffff]"
                    >
                      {truncateHash(payment.stellarTxHash)}
                      <ExternalLink
                        size={12}
                        className="text-[#62ffff]"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <span className="text-text-secondary">-</span>
                  )}
                </td>
                <td className={`${tdClass} text-right`}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(payment);
                    }}
                    className="bg-transparent border-none p-0 text-xs font-semibold text-[#62ffff] cursor-pointer hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62ffff]"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
