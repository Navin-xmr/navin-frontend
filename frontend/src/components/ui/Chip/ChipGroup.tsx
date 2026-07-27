import React from 'react';
import Chip from './Chip';
import type { ChipVariant, ChipSize } from './Chip';

export interface ChipOption {
  /** Unique identifier for the option. */
  value: string;
  /** Human-readable label. */
  label: string;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Optional per-chip variant override. */
  variant?: ChipVariant;
}

export interface ChipGroupProps {
  /** All available options. */
  options: ChipOption[];
  /** Currently selected values. */
  selected: string[];
  /** Called with the new selected array when user toggles a chip. */
  onChange: (selected: string[]) => void;
  /** Whether multiple chips can be selected at once. Defaults to true. */
  multiSelect?: boolean;
  /** Size applied to all chips. Defaults to 'md'. */
  size?: ChipSize;
  /** Default variant applied to unselected chips. Defaults to 'default'. */
  defaultVariant?: ChipVariant;
  /** Class name applied to the wrapping container. */
  className?: string;
  /** Accessible label for the group. */
  'aria-label'?: string;
}

/**
 * ChipGroup
 *
 * A group of filter / tag chips backed by controlled selection state.
 * Supports both single-select and multi-select modes.
 *
 * @example
 * <ChipGroup
 *   options={STATUS_OPTIONS}
 *   selected={activeStatuses}
 *   onChange={setActiveStatuses}
 * />
 */
const ChipGroup: React.FC<ChipGroupProps> = ({
  options,
  selected,
  onChange,
  multiSelect = true,
  size = 'md',
  defaultVariant = 'default',
  className = '',
  'aria-label': ariaLabel = 'Filter chips',
}) => {
  const toggle = (value: string) => {
    if (multiSelect) {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(next);
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          variant={option.variant ?? defaultVariant}
          size={size}
          icon={option.icon}
          selected={selected.includes(option.value)}
          onClick={() => toggle(option.value)}
        />
      ))}
    </div>
  );
};

export default ChipGroup;
