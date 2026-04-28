import React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export interface DataTableEmptyState {
  message: string;
  description?: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: DataTableEmptyState;
  onRowClick?: (row: T) => void;
  pagination?: PaginationConfig;
  className?: string;
}
