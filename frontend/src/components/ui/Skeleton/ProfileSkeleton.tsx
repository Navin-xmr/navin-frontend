import React from 'react';
import Skeleton from './Skeleton';

export interface ProfileSkeletonProps {
  count?: number;
}

const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {skeletons.map((i) => (
        <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
          <Skeleton width={40} height={40} rounded="full" className="flex-shrink-0" />
          <div className="flex flex-col gap-2">
            <Skeleton width={100} height={14} />
            <Skeleton width={140} height={12} />
          </div>
        </div>
      ))}
    </>
  );
};

export default ProfileSkeleton;
