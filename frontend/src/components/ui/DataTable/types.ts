import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}
