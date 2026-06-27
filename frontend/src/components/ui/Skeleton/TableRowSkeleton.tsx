import React from 'react';
import Skeleton from './Skeleton';

export interface TableRowSkeletonProps {
  count?: number;
}

const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({ count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {skeletons.map((i) => (
        <tr
          key={i}
          style={{
            display: 'table',
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          <td><Skeleton width={100} height={20} /></td>
          <td><Skeleton width={120} height={20} /></td>
          <td><Skeleton width={120} height={20} /></td>
          <td><Skeleton width={80} height={24} rounded="full" /></td>
          <td><Skeleton width={70} height={24} rounded="full" /></td>
          <td><Skeleton width={90} height={20} /></td>
          <td><Skeleton width={60} height={28} rounded="md" /></td>
        </tr>
      ))}
    </>
  );
};

export default TableRowSkeleton;
