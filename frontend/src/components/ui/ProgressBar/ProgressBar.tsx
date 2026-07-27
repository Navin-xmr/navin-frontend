import React from 'react';

export type ProgressBarColor = 'blue' | 'green' | 'yellow' | 'red';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number;
  label?: string;
  color?: ProgressBarColor;
  size?: ProgressBarSize;
  className?: string;
}

const colorStyles: Record<ProgressBarColor, string> = {
  blue: 'bg-accent-blue',
  green: 'bg-accent-green',
  yellow: 'bg-yellow-400',
  red: 'bg-accent-red',
};

const trackStyles: Record<ProgressBarColor, string> = {
  blue: 'bg-accent-blue/20',
  green: 'bg-accent-green/20',
  yellow: 'bg-yellow-400/20',
  red: 'bg-accent-red/20',
};

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color = 'blue',
  size = 'md',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {label !== undefined && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-text-secondary">{label}</span>
          <span className="text-sm font-semibold text-white">{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${sizeStyles[size]} ${trackStyles[color]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progress: ${clamped}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-in-out ${colorStyles[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
