import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaymentPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

const PaymentPagination: React.FC<PaymentPaginationProps> = ({
  currentPage,
  totalPages,
  total,
  onPageChange,
  onPrev,
  onNext,
}) => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-xl shadow-[inset_0_0_15px_0px_rgba(0,128,128,0.2)] max-md:flex-col max-md:gap-4">
      <div className="text-sm text-text-secondary">
        Page {currentPage} of {totalPages} &middot; {total} total
      </div>
      <div className="flex gap-2 max-md:w-full max-md:justify-center flex-wrap">
        <button
          type="button"
          aria-label="Previous page"
          onClick={onPrev}
          disabled={currentPage === 1}
          className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-9 transition-all hover:not-disabled:bg-[rgba(98,255,255,0.1)] hover:not-disabled:border-[#62ffff] hover:not-disabled:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            type="button"
            aria-label={`Page ${i + 1}`}
            aria-current={currentPage === i + 1 ? "page" : undefined}
            onClick={() => onPageChange(i + 1)}
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
          type="button"
          aria-label="Next page"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-9 transition-all hover:not-disabled:bg-[rgba(98,255,255,0.1)] hover:not-disabled:border-[#62ffff] hover:not-disabled:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaymentPagination;
