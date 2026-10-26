import React from "react";

interface PaymentSummaryCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

export interface PaymentSummaryData {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  icon,
  value,
  label,
}) => {
  return (
    <div className="relative bg-background-card border border-border rounded-2xl p-5 overflow-hidden after:absolute after:top-0 after:right-0 after:w-24 after:h-24 after:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] after:pointer-events-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="w-10 h-10 rounded-[10px] bg-background-elevated flex items-center justify-center text-accent-blue">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-text-secondary text-xs font-semibold uppercase mb-2">
          {label}
        </div>
        <div className="text-[32px] font-bold leading-none max-md:text-2xl">
          {value}
        </div>
      </div>
    </div>
  );
};

const SKELETON_CARD_COUNT = 3;

interface PaymentSummaryCardsProps {
  cards?: PaymentSummaryData[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({
  cards,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading payment summary"
        className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
          <div
            key={i}
            className="h-[120px] rounded-2xl bg-[rgba(98,255,255,0.1)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-5 text-text-secondary"
      >
        <span>Couldn't load the payment summary: {error}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-[rgba(98,255,255,0.2)] px-3 py-2 text-sm text-text-primary hover:border-[#62ffff] hover:text-[#62ffff] cursor-pointer"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div role="status" className="mb-6 rounded-2xl border border-border p-5 text-text-secondary">
        No payment data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <PaymentSummaryCard
          key={card.label}
          icon={card.icon}
          value={card.value}
          label={card.label}
        />
      ))}
    </div>
  );
};

export default PaymentSummaryCards;
