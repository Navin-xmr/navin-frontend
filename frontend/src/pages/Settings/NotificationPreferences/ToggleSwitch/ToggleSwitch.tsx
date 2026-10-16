import React from 'react';

export interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  ariaLabel: string;
  title?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  disabled = false,
  onChange,
  ariaLabel,
  title,
}) => (
  <label
    htmlFor={id}
    title={title}
    className={`relative inline-block w-11 h-6 flex-shrink-0 ${
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
    }`}
  >
    <input
      id={id}
      type="checkbox"
      className="sr-only"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    />
    <span
      className={`absolute inset-0 rounded-full border transition-colors duration-300 ${
        checked
          ? 'bg-[rgba(59,130,246,0.15)] border-[#3B82F6]'
          : 'bg-[#1E293B] border-[#334155]'
      }`}
    />
    <span
      className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300 ${
        checked
          ? 'translate-x-5 bg-[#3B82F6]'
          : 'translate-x-0 bg-[#94A3B8]'
      }`}
    />
  </label>
);

export default ToggleSwitch;
