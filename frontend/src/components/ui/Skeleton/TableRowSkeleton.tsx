import React from 'react';
import Skeleton from './Skeleton';

export interface TableRowSkeletonProps {
  count?: number;
  columns?: number;
}

export interface ShipmentsTableSkeletonProps {
  count?: number;
}

// Column widths for the shipments table: checkbox (40px) + 7 data columns
const SHIPMENTS_COL_WIDTHS = [40, 140, 120, 120, 90, 80, 110, 80];
const SKELETON_HEIGHTS = [20, 20, 20, 24, 24, 20, 28];
const SKELETON_ROUNDED: Array<'none' | 'sm' | 'md' | 'lg' | 'full'> = [
  'md',
  'md',
  'md',
  'full',
  'full',
  'md',
  'md',
];

const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({ count = 1, columns = 8 }) => {
  const rows = Array.from({ length: count }, (_, i) => i);

  // Build per-cell widths from SHIPMENTS_COL_WIDTHS, trimmed/padded to `columns`
  const cellWidths = SHIPMENTS_COL_WIDTHS.slice(0, columns);
  // If columns > SHIPMENTS_COL_WIDTHS.length, pad with 100
  while (cellWidths.length < columns) {
    cellWidths.push(100);
  }

  return (
    <>
      {rows.map((i) => (
        <tr
          key={i}
          aria-hidden="true"
          style={{
            display: 'table',
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          {/* First cell is the checkbox placeholder */}
          <td style={{ width: `${cellWidths[0]}px` }}>
            <Skeleton width={16} height={16} rounded="sm" />
          </td>

          {/* Remaining data cells */}
          {cellWidths.slice(1).map((colWidth, colIdx) => (
            <td key={colIdx}>
              <Skeleton
                width={colWidth - 16}
                height={SKELETON_HEIGHTS[colIdx] ?? 20}
                rounded={SKELETON_ROUNDED[colIdx] ?? 'md'}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/**
 * ShipmentsTableSkeleton — full skeleton table matching the Shipments page layout.
 * Renders a <table> with a <thead> (matching real column headers) and a <tbody>
 * containing `count` skeleton rows. Use this for the initial-load state.
 */
export const ShipmentsTableSkeleton: React.FC<ShipmentsTableSkeletonProps> = ({ count = 8 }) => {
  return (
    <table
      className="shipments-table"
      style={{ tableLayout: 'fixed', width: '100%' }}
      aria-label="Loading shipments"
      aria-busy="true"
    >
      <thead>
        <tr>
          <th style={{ width: '40px' }} aria-hidden="true" />
          <th>Shipment ID</th>
          <th>Origin</th>
          <th>Destination</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Created Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <TableRowSkeleton count={count} columns={8} />
      </tbody>
    </table>
  );
};

export default TableRowSkeleton;
