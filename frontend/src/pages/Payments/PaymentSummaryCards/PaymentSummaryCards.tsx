import React from "react";
import { CreditCard, DollarSign, Clock, CheckCircle } from "lucide-react";

interface PaymentSummaryCardProps {
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

const PaymentSummaryCards: React.FC = () => {
  // Mock data - in real app, this would come from props or API
  const summaryData = [
    {
      icon: <CreditCard size={20} />,
      value: "156",
      label: "Total Payments",
    },
    {
      icon: <DollarSign size={20} />,
      value: "$127,450",
      label: "Total Value",
    },
    {
      icon: <Clock size={20} />,
      value: "12",
      label: "Pending Payments",
    },
    {
      icon: <CheckCircle size={20} />,
      value: "134",
      label: "Released Payments",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryData.map((card, index) => (
        <PaymentSummaryCard
          key={index}
          icon={card.icon}
          value={card.value}
          label={card.label}
        />
      ))}
    </div>
  );
};

export default PaymentSummaryCards;
