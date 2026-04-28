import { useMemo, useState } from 'react';
import Pagination from './Pagination';

const PAGE_SIZE = 10;
const MOCK_TOTAL_ITEMS = 237;

function PaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(MOCK_TOTAL_ITEMS / PAGE_SIZE);

  const currentRange = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, MOCK_TOTAL_ITEMS);
    return `${start}-${end}`;
  }, [currentPage]);

  return (
    <section className="rounded-2xl border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] p-6 shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.2)]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-text-primary">Pagination Demo</h2>
        <p className="text-sm text-text-secondary mt-1">
          Showing items <span className="text-text-primary font-medium">{currentRange}</span> of{' '}
          <span className="text-text-primary font-medium">{MOCK_TOTAL_ITEMS}</span>
        </p>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        siblingCount={1}
      />
    </section>
  );
}

export default PaginationExample;
