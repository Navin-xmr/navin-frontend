import React from 'react';
import { X } from 'lucide-react';

export type TagVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';
export type TagSize = 'xs' | 'sm' | 'md';

export interface TagProps {
  label: string;
  variant?: TagVariant;
  size?: TagSize;
  onRemove?: () => void;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  default: 'border-slate-600/60 bg-slate-800/70 text-slate-100',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  danger: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  neutral: 'border-gray-500/30 bg-gray-500/10 text-gray-300',
  accent: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
};

const dotColors: Record<TagVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  info: 'bg-sky-400',
  neutral: 'bg-gray-400',
  accent: 'bg-cyan-400',
};

const sizeClasses: Record<TagSize, string> = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

const Tag: React.FC<TagProps> = ({ 
  label, 
  variant = 'default', 
  size = 'md', 
  onRemove, 
  icon, 
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-medium whitespace-nowrap ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {dot ? (
        <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} aria-hidden="true" />
      ) : icon ? (
        <span className="flex h-4 w-4 items-center justify-center shrink-0">{icon}</span>
      ) : null}
      <span>{label}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Remove ${label}`}
          className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-current/80 transition hover:bg-black/10 hover:text-current focus-visible:outline-2 focus-visible:outline-current"
        >
          <X size={12} />
        </button>
      ) : null}
    </span>
  );
};

// Pre-configured status badge variants for common use cases
export interface StatusBadgeProps {
  status: string;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default', size = 'sm', className = '' }) => (
  <Tag label={status} variant={variant} size={size} dot className={className} />
);

// Status variant mapping for common statuses
export const STATUS_VARIANT_MAP: Record<string, TagVariant> = {
  active: 'success',
  completed: 'success',
  delivered: 'success',
  released: 'success',
  success: 'success',
  pending: 'warning',
  in_transit: 'info',
  processing: 'info',
  escrowed: 'accent',
  failed: 'danger',
  cancelled: 'danger',
  disputed: 'danger',
  error: 'danger',
  idle: 'neutral',
  draft: 'neutral',
};

export default Tag;
