import { CheckCircle, Clock, ShieldCheck } from "lucide-react";
import type { RevenueSummaryResponse } from "@services/api/endpoints/settlements";
import type { PaymentSummaryData } from "./PaymentSummaryCards";

// The summary endpoint reports amounts without a currency, so none is shown.
const formatAmount = (value: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);

/**
 * Maps the aggregated settlements summary to cards. A summary with nothing in
 * any bucket returns no cards, so the caller shows the empty state instead of
 * a row of zeros.
 */
export function buildPaymentSummaryCards(
  summary: RevenueSummaryResponse,
): PaymentSummaryData[] {
  const { totalReleased, totalInEscrow, totalPending } = summary;
  if (totalReleased === 0 && totalInEscrow === 0 && totalPending === 0) {
    return [];
  }

  return [
    {
      icon: <CheckCircle size={20} />,
      value: formatAmount(totalReleased),
      label: "Released this month",
    },
    {
      icon: <ShieldCheck size={20} />,
      value: formatAmount(totalInEscrow),
      label: "In escrow this month",
    },
    {
      icon: <Clock size={20} />,
      value: formatAmount(totalPending),
      label: "Pending this month",
    },
  ];
}
