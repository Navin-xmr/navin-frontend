import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Loader2, X } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  metadata?: Record<string, unknown>;
}

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSelectOption?: (option: ComboboxOption) => void;
  options: ComboboxOption[];
  placeholder?: string;
  isLoading?: boolean;
  noResultsMessage?: string;
  loadingMessage?: string;
  ariaLabel?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  clearable?: boolean;
  onBlur?: () => void;
}

const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  onSelectOption,
  options,
  placeholder = 'Search...',
  isLoading = false,
  noResultsMessage = 'No results found',
  loadingMessage = 'Loading...',
  ariaLabel = 'Search',
  disabled = false,
  name,
  id,
  className = '',
  clearable = true,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- controlled component sync
    setInputValue(value);
  }, [value]);

  // Filter options based on input
  const filteredOptions = React.useMemo(() => {
    if (!inputValue.trim()) return options;
    const q = inputValue.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel?.toLowerCase().includes(q) ?? false),
    );
  }, [options, inputValue]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return;
    const activeOption = listboxRef.current.children[activeIndex] as HTMLElement;
    if (activeOption) {
      activeOption.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Announce option count for screen readers
  const announceCount = useCallback((count: number) => {
    if (announcementRef.current) {
      announcementRef.current.textContent =
        count === 0
          ? noResultsMessage
          : `${count} ${count === 1 ? 'suggestion' : 'suggestions'} available`;
    }
  }, [noResultsMessage]);

  useEffect(() => {
    if (isOpen) {
      announceCount(filteredOptions.length);
    }
  }, [isOpen, filteredOptions.length, announceCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setActiveIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (filteredOptions.length > 0) {
      setIsOpen(true);
    }
  };

  const selectOption = useCallback(
    (option: ComboboxOption) => {
      setInputValue(option.label);
      onChange(option.label);
      onSelectOption?.(option);
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [onChange, onSelectOption],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setActiveIndex(-1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  const comboId = id || name || 'combobox';
  const listboxId = `${comboId}-listbox`;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={comboId}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={inputValue}
        onChange={handleInputChange}
        onBlur={() => onBlur?.()}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
          autoComplete="off"
          className="w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg pl-3 pr-16 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] focus:ring-1 focus:ring-[#62ffff]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {clearable && inputValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear input"
              className="flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleOpen}
            aria-label={isOpen ? 'Close suggestions' : 'Open suggestions'}
            disabled={disabled}
            className="flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Screen reader live region */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={`${ariaLabel} suggestions`}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-[rgba(98,255,255,0.2)] bg-[#121620] shadow-lg shadow-black/40 py-1"
        >
          {isLoading ? (
            <li
              className="flex items-center gap-2 px-3 py-3 text-sm text-slate-400"
              role="option"
              aria-selected={false}
            >
              <Loader2 size={14} className="animate-spin" />
              {loadingMessage}
            </li>
          ) : filteredOptions.length === 0 ? (
            <li
              className="px-3 py-3 text-sm text-slate-400 text-center"
              role="option"
              aria-selected={false}
            >
              {noResultsMessage}
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-3 py-2.5 cursor-pointer transition-colors text-sm ${
                  index === activeIndex
                    ? 'bg-[rgba(98,255,255,0.12)] text-white'
                    : 'text-slate-300 hover:bg-[rgba(98,255,255,0.06)] hover:text-white'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-xs text-slate-400 mt-0.5">
                      {option.sublabel}
                    </span>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Combobox;
