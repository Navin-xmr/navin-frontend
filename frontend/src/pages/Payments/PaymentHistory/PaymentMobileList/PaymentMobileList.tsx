import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Settlement } from "@services/api/endpoints/settlements";
import { getStellarExpertTxUrl } from "@utils/stellar";
import { statusClasses, statusDotClasses, truncateHash } from "../paymentUtils";

export interface PaymentMobileListProps {
  payments: Settlement[];
  isLoading: boolean;
  onCardClick: (payment: Settlement) => void;
}

const PaymentMobileList: React.FC<PaymentMobileListProps> = ({
  payments,
  isLoading,
  onCardClick,
}) => {
  return (
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
              onClick={() => onCardClick(payment)}
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
                    href={getStellarExpertTxUrl(payment.stellarTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-xs text-text-secondary inline-flex items-center gap-1 hover:text-[#62ffff] transition-colors"
                  >
                    {truncateHash(payment.stellarTxHash)}
                    <ExternalLink
                      size={11}
                      className="text-[#62ffff]"
                      aria-hidden="true"
                    />
                  </a>
                ) : (
                  <span className="font-mono text-xs text-text-secondary">
                    -
                  </span>
                )}
              </div>
            </button>
          ))}
    </div>
  );
};

export default PaymentMobileList;
