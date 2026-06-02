import type { ReactElement } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationProps } from './types';

const ELLIPSIS = 'ellipsis';

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, index) => index + start);

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): Array<number | string> => {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, 3 + 2 * siblingCount);
    return [...leftRange, ELLIPSIS, totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(totalPages - (2 * siblingCount + 2), totalPages);
    return [1, ELLIPSIS, ...rightRange];
  }

  const middleRange = range(leftSiblingIndex, rightSiblingIndex);
  return [1, ELLIPSIS, ...middleRange, ELLIPSIS, totalPages];
};

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
}: PaginationProps): ReactElement {
  const paginationItems = getPaginationItems(currentPage, totalPages, siblingCount);

  const navigateToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange(page);
  };

  return (
    <nav
      className={`flex items-center gap-2 ${className}`}
      aria-label="Pagination navigation"
      role="navigation"
    >
      <button
        type="button"
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-[36px] transition-all hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {paginationItems.map((item, index) => {
        if (item === ELLIPSIS) {
          return (
            <span
              key={`${item}-${index}`}
              className="min-w-[36px] text-center text-text-secondary"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const page = Number(item);
        const isCurrentPage = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => navigateToPage(page)}
            className={`border px-3 py-2 rounded-md text-sm font-semibold cursor-pointer min-w-[36px] transition-all ${
              isCurrentPage
                ? 'bg-[#62ffff] border-[#62ffff] text-black'
                : 'bg-transparent border-[rgba(98,255,255,0.2)] text-text-primary hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff]'
            }`}
            aria-label={`Go to page ${page}`}
            aria-current={isCurrentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-[36px] transition-all hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Go to next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default Pagination;
