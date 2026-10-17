import React from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { SettlementStatus } from "@services/api/endpoints/settlements";

export interface PaymentFiltersProps {
  filterStatus: SettlementStatus | "All";
  sortOrder: "asc" | "desc";
  onFilterChange: (status: SettlementStatus | "All") => void;
  onSortToggle: () => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filterStatus,
  sortOrder,
  onFilterChange,
  onSortToggle,
}) => {
  return (
    <div className="flex gap-3 max-md:w-full max-md:flex-col max-md:gap-2">
      <div className="relative flex items-center max-md:w-full">
        <select
          value={filterStatus}
          onChange={(e) => {
            onFilterChange(e.target.value as SettlementStatus | "All");
          }}
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
        onClick={onSortToggle}
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
  );
};

export default PaymentFilters;
