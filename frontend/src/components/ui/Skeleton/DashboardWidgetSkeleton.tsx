import React from 'react';
import Skeleton from './Skeleton';

export interface DashboardWidgetSkeletonProps {
  count?: number;
}

const DashboardWidgetSkeleton: React.FC<DashboardWidgetSkeletonProps> = ({ count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {skeletons.map((i) => (
        <div key={i} className="bg-[#14171e] border border-border rounded-2xl mb-4 last:mb-0 overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex justify-between items-center md:flex-col md:gap-3 md:items-start">
            <div className="flex items-center gap-2.5">
              <Skeleton width={18} height={18} rounded="full" />
              <Skeleton width={140} height={20} />
            </div>
            <div className="flex gap-1 bg-[#1a1f2e] rounded-lg p-[3px]">
              <Skeleton width={32} height={24} rounded="md" />
              <Skeleton width={32} height={24} rounded="md" />
              <Skeleton width={32} height={24} rounded="md" />
            </div>
          </div>
          
          <div className="p-5 h-[300px] md:h-[220px]">
             <Skeleton width="100%" height="100%" rounded="none" />
          </div>
        </div>
      ))}
    </>
  );
};

export default DashboardWidgetSkeleton;
