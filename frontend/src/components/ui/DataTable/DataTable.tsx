import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ArrowUpDown } from 'lucide-react';
import type { DataTableProps, SortDirection } from './types';

const DEFAULT_PAGE_SIZE = 10;

const containerClass =
  'bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]';
const thClass =
  'text-left px-6 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]';
const tdClass =
  'px-6 py-4 text-sm text-text-primary border-b border-[rgba(98,255,255,0.2)] last:border-b-0';

function SortIcon({ colKey, sortKey, sortDir }: { colKey: string; sortKey: string | null; sortDir: SortDirection }) {
  if (sortKey !== colKey) return <ArrowUpDown size={13} className="text-text-secondary" />;
  if (sortDir === 'asc') return <ChevronUp size={13} className="text-[#62ffff]" />;
  return <ChevronDown size={13} className="text-[#62ffff]" />;
}

function DataTable<T extends object>({
  columns,
  data,
  pageSize = DEFAULT_PAGE_SIZE,
  onRowClick,
  isLoading = false,
}: DataTableProps<T>): React.ReactElement {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal === bVal) return 0;
      const cmp = aVal! < bVal! ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pagedData = sortedData.slice(pageStart, pageStart + pageSize);

  if (isLoading) {
    return (
      <div className={containerClass}>
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-[rgba(19,186,186,0.1)]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={thClass} style={col.width ? { width: col.width } : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className={tdClass}>
                    <div className="h-4 rounded bg-[rgba(98,255,255,0.08)] animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={`${containerClass} overflow-x-auto`}>
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-[rgba(19,186,186,0.1)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${thClass}${col.sortable ? ' cursor-pointer select-none hover:text-white transition-colors' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    col.sortable
                      ? sortKey === col.key
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-text-secondary text-sm">
                  No data available
                </td>
              </tr>
            ) : (
              pagedData.map((row, i) => (
                <tr
                  key={i}
                  className={`transition-colors${onRowClick ? ' cursor-pointer hover:bg-[rgba(98,255,255,0.05)]' : ' hover:bg-[rgba(98,255,255,0.03)]'}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={tdClass}>
                      {col.render
                        ? col.render((row as Record<string, unknown>)[col.key] as T[keyof T], row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-xl shadow-[inset_0_0_15px_0px_rgba(0,128,128,0.2)]">
          <span className="text-sm text-text-secondary">
            {pageStart + 1}–{Math.min(pageStart + pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm flex items-center min-w-[36px] transition-all hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-text-primary px-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm flex items-center min-w-[36px] transition-all hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
