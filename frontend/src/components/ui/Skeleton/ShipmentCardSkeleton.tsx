import React from 'react';
import Skeleton from './Skeleton';

export interface ShipmentCardSkeletonProps {
  count?: number;
}

const ShipmentCardSkeleton: React.FC<ShipmentCardSkeletonProps> = ({ count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {skeletons.map((i) => (
        <div
          key={i}
          className="w-full bg-[#14171e] border border-[#1e293b] rounded-lg p-3 mb-2 last:mb-0"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={64} height={20} rounded="full" />
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <Skeleton width={14} height={14} rounded="full" className="flex-shrink-0" />
            <Skeleton width="40%" height={16} />
            <span className="text-[#64748b]">→</span>
            <Skeleton width="40%" height={16} />
          </div>

          <Skeleton width="60%" height={12} />
        </div>
      ))}
    </>
  );
};

export default ShipmentCardSkeleton;
