import React from 'react';
import { X } from 'lucide-react';

export interface TagProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  onRemove?: () => void;
  icon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<TagProps['variant']>, string> = {
  default: 'border-slate-600/60 bg-slate-800/70 text-slate-100',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  danger: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
};

const sizeClasses: Record<NonNullable<TagProps['size']>, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

const Tag: React.FC<TagProps> = ({ label, variant = 'default', size = 'md', onRemove, icon }) => {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {icon ? <span className="flex h-4 w-4 items-center justify-center">{icon}</span> : null}
      <span>{label}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-current/80 transition hover:bg-black/10 hover:text-current"
        >
          <X size={12} />
        </button>
      ) : null}
    </span>
  );
};

export default Tag;
