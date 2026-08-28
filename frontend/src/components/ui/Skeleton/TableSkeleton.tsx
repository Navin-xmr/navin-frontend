import React from 'react';
import Skeleton, { SkeletonProps } from './Skeleton';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  variant?: SkeletonProps['variant'];
}

/** Column width presets to give each column a natural varied appearance */
const COLUMN_WIDTHS = [100, 140, 130, 90, 80, 110, 70];

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  variant = 'pulse',
}) => {
  const rowIndices = Array.from({ length: rows }, (_, i) => i);
  const colIndices = Array.from({ length: columns }, (_, i) => i);

  return (
    <div className="w-full overflow-x-auto bg-[#14171e] border border-[#1e293b] rounded-lg">
      <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
        {/* Header row skeleton */}
        <thead>
          <tr className="border-b border-[#1e293b]">
            {colIndices.map((colIdx) => (
              <th key={colIdx} className="p-4">
                <Skeleton
                  width={COLUMN_WIDTHS[colIdx % COLUMN_WIDTHS.length] * 0.7}
                  height={14}
                  rounded="sm"
                  variant={variant}
                />
              </th>
            ))}
          </tr>
        </thead>

        {/* Data rows skeleton */}
        <tbody>
          {rowIndices.map((rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-[#1e293b] last:border-b-0"
            >
              {colIndices.map((colIdx) => (
                <td key={colIdx} className="p-4">
                  <Skeleton
                    width={COLUMN_WIDTHS[colIdx % COLUMN_WIDTHS.length]}
                    height={20}
                    rounded={colIdx === columns - 1 ? 'full' : 'md'}
                    variant={variant}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
