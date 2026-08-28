import React from 'react';
import { X, Check } from 'lucide-react';

export type ChipVariant = 'default' | 'active' | 'success' | 'warning' | 'danger' | 'info';
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  /** Label text displayed inside the chip. */
  label: string;
  /** Visual style variant. Defaults to 'default'. */
  variant?: ChipVariant;
  /** Size of the chip. Defaults to 'md'. */
  size?: ChipSize;
  /**
   * When provided the chip renders as a toggle-able filter chip.
   * Clicking the chip body calls this handler — NOT onRemove.
   */
  onClick?: () => void;
  /**
   * When provided a remove (×) button is rendered at the trailing end.
   * If both onClick and onRemove are provided, the click targets are separate.
   */
  onRemove?: () => void;
  /** Render a leading icon inside the chip. */
  icon?: React.ReactNode;
  /** Whether the chip is in a selected / active filter state. */
  selected?: boolean;
  /** Disabled state — prevents interaction. */
  disabled?: boolean;
  /** Additional class names. */
  className?: string;
}

const variantBase: Record<ChipVariant, string> = {
  default: 'border-border bg-background-elevated text-text-primary',
  active:  'border-accent-blue/60 bg-accent-blue/10 text-accent-blue',
  success: 'border-accent-green/40 bg-accent-green/10 text-accent-green',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  danger:  'border-accent-red/40 bg-accent-red/10 text-accent-red',
  info:    'border-primary/40 bg-primary/10 text-primary',
};

const variantHover: Record<ChipVariant, string> = {
  default: 'hover:border-accent-blue/50 hover:bg-background-card',
  active:  'hover:bg-accent-blue/20',
  success: 'hover:bg-accent-green/20',
  warning: 'hover:bg-amber-500/20',
  danger:  'hover:bg-accent-red/20',
  info:    'hover:bg-primary/20',
};

const sizeClasses: Record<ChipSize, string> = {
  sm: 'px-2.5 py-0.5 text-xs gap-1.5',
  md: 'px-3 py-1 text-sm gap-2',
};

const iconSizeClasses: Record<ChipSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
};

/**
 * Chip
 *
 * A versatile chip component for filters, tags, and status labels.
 *
 * - Use `onClick` to make it a clickable filter chip (toggles selection).
 * - Use `onRemove` to add a dismiss button (e.g. active filter tags).
 * - Use `selected` to visually indicate an active filter.
 * - Use `variant` to communicate semantic meaning.
 *
 * @example
 * // Filter chip
 * <Chip label="In Transit" variant="active" onClick={toggle} selected={isActive} />
 *
 * // Dismissable tag
 * <Chip label="Urgent" variant="warning" onRemove={() => remove('urgent')} />
 */
const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  size = 'md',
  onClick,
  onRemove,
  icon,
  selected = false,
  disabled = false,
  className = '',
}) => {
  const isInteractive = Boolean(onClick);
  const resolvedVariant: ChipVariant = selected ? 'active' : variant;

  const baseClasses = [
    'inline-flex items-center rounded-full border font-medium transition-colors duration-150 select-none',
    variantBase[resolvedVariant],
    isInteractive && !disabled ? `cursor-pointer ${variantHover[resolvedVariant]}` : '',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {selected && !icon && (
        <Check
          aria-hidden="true"
          className={`shrink-0 ${iconSizeClasses[size]}`}
        />
      )}
      {icon && !selected && (
        <span aria-hidden="true" className={`shrink-0 flex items-center justify-center ${iconSizeClasses[size]}`}>
          {icon}
        </span>
      )}
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`shrink-0 flex items-center justify-center rounded-full transition-colors duration-150 text-current/70 hover:text-current hover:bg-black/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-current ${
            size === 'sm' ? 'w-3.5 h-3.5 -mr-0.5' : 'w-4 h-4 -mr-0.5'
          }`}
        >
          <X size={size === 'sm' ? 10 : 12} aria-hidden="true" />
        </button>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={baseClasses}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={baseClasses} aria-label={label}>
      {content}
    </span>
  );
};

export default Chip;
