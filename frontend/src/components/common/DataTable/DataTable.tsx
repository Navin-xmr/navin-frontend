import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import Button from '@components/Button';
import type { DataTableProps, SortDirection } from './types';

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyState = { message: 'No data available' },
  onRowClick,
  pagination,
  className = '',
}: DataTableProps<T>): React.ReactElement {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      const cmp = aVal! < bVal! ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const containerClass =
    'bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]';
  const thClass =
    'text-left px-6 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]';
  const tdClass =
    'px-6 py-4 text-sm text-text-primary border-b border-[rgba(98,255,255,0.2)]';

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={13} className="text-text-secondary" />;
    if (sortDir === 'asc') return <ChevronUp size={13} className="text-[#62ffff]" />;
    return <ChevronDown size={13} className="text-[#62ffff]" />;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`${containerClass} ${className}`}>
        <table className="w-full border-collapse">
          <thead className="bg-[rgba(19,186,186,0.1)]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={thClass}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
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

  // Empty state
  if (sortedData.length === 0) {
    return (
      <div className={`${containerClass} ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
          <div className="text-5xl">📭</div>
          <div className="flex flex-col gap-2 max-w-sm">
            <h3 className="text-lg font-semibold text-text-primary">{emptyState.message}</h3>
            {emptyState.description && (
              <p className="text-sm text-text-secondary">{emptyState.description}</p>
            )}
          </div>
          {emptyState.cta && (
            <Button variant="primary" size="md" onClick={emptyState.cta.onClick}>
              {emptyState.cta.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const showPagination = pagination && pagination.totalPages > 1;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Table */}
      <div className={`${containerClass} overflow-x-auto`}>
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-[rgba(19,186,186,0.1)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${thClass} ${col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`transition-colors last:border-b-0 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-[rgba(98,255,255,0.05)]'
                    : 'hover:bg-[rgba(98,255,255,0.03)]'
                }`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={tdClass}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex justify-between items-center px-6 py-4 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-xl shadow-[inset_0_0_15px_0px_rgba(0,128,128,0.2)] md:flex-col md:gap-4">
          {pagination.totalItems !== undefined && pagination.itemsPerPage !== undefined ? (
            <span className="text-sm text-text-secondary">
              Showing{' '}
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems}
            </span>
          ) : (
            <span className="text-sm text-text-secondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-[36px] transition-all hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => pagination.onPageChange(i + 1)}
                className={`border px-3 py-2 rounded-md text-sm font-semibold cursor-pointer min-w-[36px] transition-all ${
                  pagination.currentPage === i + 1
                    ? 'bg-[#62ffff] border-[#62ffff] text-black'
                    : 'bg-transparent border-[rgba(98,255,255,0.2)] text-text-primary hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff]'
                }`}
                aria-label={`Page ${i + 1}`}
                aria-current={pagination.currentPage === i + 1 ? 'page' : undefined}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-[36px] transition-all hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
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
