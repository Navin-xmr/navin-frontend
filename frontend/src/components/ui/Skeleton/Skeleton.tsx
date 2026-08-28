import React from 'react';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  variant?: 'pulse' | 'shimmer';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
  variant = 'pulse',
}) => {
  const baseClasses = variant === 'pulse' ? 'animate-pulse bg-[#1e293b]' : 'relative overflow-hidden bg-[#1e293b]';
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      {variant === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      )}
    </div>
  );
};

export default Skeleton;
