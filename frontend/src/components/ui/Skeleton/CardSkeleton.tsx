import React from 'react';
import Skeleton, { SkeletonProps } from './Skeleton';

export interface CardSkeletonProps {
  count?: number;
  variant?: SkeletonProps['variant'];
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1, variant = 'pulse' }) => {
  const cards = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {cards.map((i) => (
        <div
          key={i}
          className="w-full bg-[#14171e] border border-[#1e293b] rounded-xl p-5 mb-4 last:mb-0"
        >
          {/* Icon placeholder */}
          <div className="flex items-start justify-between mb-4">
            <Skeleton width={44} height={44} rounded="lg" variant={variant} />
            <Skeleton width={60} height={20} rounded="full" variant={variant} />
          </div>

          {/* Title line */}
          <Skeleton width="55%" height={14} rounded="sm" className="mb-2" variant={variant} />

          {/* Value line */}
          <Skeleton width="70%" height={28} rounded="md" className="mb-3" variant={variant} />

          {/* Sub-line */}
          <Skeleton width="45%" height={12} rounded="sm" variant={variant} />
        </div>
      ))}
    </>
  );
};

export default CardSkeleton;
