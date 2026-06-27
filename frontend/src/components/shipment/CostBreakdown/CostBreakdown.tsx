import React from "react";
import { Receipt, TrendingDown, Globe, Package, Shield, FileText, Zap } from "lucide-react";

export interface CostBreakdownData {
  baseRate: number;
  weightSurcharge: number;
  fuelSurcharge: number;
  insuranceFee: number;
  customsDuty?: number;
  discount?: number;
  total: number;
  currency: string;
}

export interface CostBreakdownProps {
  data?: CostBreakdownData | null;
  isLoading?: boolean;
  mode?: "estimate" | "confirmed";
}

// ─── Currency formatter ───────────────────────────────────────────────────────
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Skeleton shown while loading ─────────────────────────────────────────────
const SkeletonRow: React.FC = () => (
  <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.06)] animate-pulse" />
      <div className="h-4 w-32 rounded bg-[rgba(255,255,255,0.06)] animate-pulse" />
    </div>
    <div className="h-4 w-20 rounded bg-[rgba(255,255,255,0.06)] animate-pulse" />
  </div>
);

const Skeleton: React.FC = () => (
  <div className="space-y-1">
    <p className="text-[rgba(255,255,255,0.4)] text-xs uppercase tracking-widest mb-4 animate-pulse">
      Calculating…
    </p>
    {[...Array(5)].map((_, i) => (
      <SkeletonRow key={i} />
    ))}
    <div className="flex items-center justify-between pt-5 mt-3">
      <div className="h-6 w-24 rounded bg-[rgba(0,212,200,0.15)] animate-pulse" />
      <div className="h-7 w-28 rounded-lg bg-[rgba(0,212,200,0.15)] animate-pulse" />
    </div>
  </div>
);

// ─── Icon map ─────────────────────────────────────────────────────────────────
const LINE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  "Base Rate": Package,
  "Weight Surcharge": TrendingDown,
  "Fuel Surcharge": Zap,
  "Insurance Fee": Shield,
  "Customs Duty": Globe,
  "Discount": FileText,
};

// ─── Single line item row ─────────────────────────────────────────────────────
interface LineRowProps {
  label: string;
  amount: number;
  currency: string;
  isDiscount?: boolean;
}

const LineRow: React.FC<LineRowProps> = ({ label, amount, currency, isDiscount }) => {
  const Icon = LINE_ICONS[label] ?? Receipt;
  const displayAmount = isDiscount ? -Math.abs(amount) : amount;

  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)] group">
      <div className="flex items-center gap-3">
        <div className="bg-[rgba(0,212,200,0.08)] group-hover:bg-[rgba(0,212,200,0.14)] transition-colors rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#00d4c8]" />
        </div>
        <span className="text-[rgba(255,255,255,0.75)] text-sm">{label}</span>
      </div>
      <span
        className={`text-sm font-medium tabular-nums ${
          isDiscount ? "text-green-400" : "text-[rgba(255,255,255,0.9)]"
        }`}
      >
        {formatCurrency(displayAmount, currency)}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const CostBreakdown: React.FC<CostBreakdownProps> = ({
  data,
  isLoading = false,
  mode = "estimate",
}) => {
  const title = mode === "confirmed" ? "COST BREAKDOWN" : "ESTIMATED COSTS";
  const subtitle =
    mode === "confirmed"
      ? "Final confirmed charges for this shipment"
      : "Live estimate — updated as you fill in shipment details";

  const lineItems = data
    ? [
        { key: "base", label: "Base Rate", amount: data.baseRate, currency: data.currency },
        { key: "weight", label: "Weight Surcharge", amount: data.weightSurcharge, currency: data.currency },
        { key: "fuel", label: "Fuel Surcharge", amount: data.fuelSurcharge, currency: data.currency },
        { key: "insurance", label: "Insurance Fee", amount: data.insuranceFee, currency: data.currency },
        { key: "customs", label: "Customs Duty", amount: data.customsDuty ?? 0, currency: data.currency, hideIfZero: true },
        { key: "discount", label: "Discount", amount: data.discount ?? 0, currency: data.currency, isDiscount: true, hideIfZero: true },
      ]
    : [];

  return (
    <div
      className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6"
      aria-label="Shipment cost breakdown"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-[rgba(0,212,200,0.12)] rounded-xl w-10 h-10 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-[#00d4c8]" />
        </div>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.5rem,3.5vw,2.25rem)] font-normal tracking-[0.04em] leading-[1.2] text-white m-0">
          {title.split(" ").map((word, i, arr) =>
            i === arr.length - 1 ? (
              <span key={i} className="text-[#00d4c8]"> {word}</span>
            ) : (
              <span key={i}>{i > 0 ? " " : ""}{word}</span>
            )
          )}
        </h2>
      </div>
      <p className="text-[rgba(200,230,240,0.5)] text-sm mb-8 ml-[3.25rem]">{subtitle}</p>

      {/* Body */}
      <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] px-6 py-5">
        {isLoading ? (
          <Skeleton />
        ) : !data ? (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="bg-[rgba(255,255,255,0.04)] rounded-full w-16 h-16 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-[rgba(255,255,255,0.2)]" />
            </div>
            <p className="text-[rgba(255,255,255,0.4)] text-sm max-w-xs">
              Fill in origin, destination, and weight to see an estimate.
            </p>
          </div>
        ) : (
          <>
            {lineItems
              .filter((item) => !(item.hideIfZero && item.amount === 0))
              .map((item) => (
                <LineRow
                  key={item.key}
                  label={item.label}
                  amount={item.amount}
                  currency={item.currency}
                  isDiscount={item.isDiscount}
                />
              ))}

            {/* Total row — visually distinct */}
            <div className="flex items-center justify-between pt-5 mt-3">
              <span className="text-[rgba(255,255,255,0.6)] text-sm uppercase tracking-widest font-semibold">
                Total
              </span>
              <div className="bg-[rgba(0,212,200,0.12)] border border-[rgba(0,212,200,0.35)] rounded-xl px-5 py-2">
                <span className="text-[#00d4c8] text-xl font-bold tabular-nums">
                  {formatCurrency(data.total, data.currency)}
                </span>
              </div>
            </div>

            {mode === "estimate" && (
              <p className="text-[rgba(255,255,255,0.3)] text-xs mt-4 text-right">
                * Estimate only. Final charges may vary.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CostBreakdown;