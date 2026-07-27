import React, { useState } from 'react';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BG_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
];

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % BG_COLORS.length;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;
  const initials = getInitials(name);
  const bgColor = BG_COLORS[getColorIndex(name)];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${showImage ? '' : bgColor} ${className}`}
      aria-label={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-semibold text-white leading-none select-none">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
