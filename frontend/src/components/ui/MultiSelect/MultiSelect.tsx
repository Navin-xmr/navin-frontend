import React, { useEffect, useId, useMemo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputId = useId();

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options;
    }

    const term = searchTerm.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, searchable, searchTerm]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex((current) => (current + 1) % Math.max(filteredOptions.length, 1));
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex((current) => (current - 1 + Math.max(filteredOptions.length, 1)) % Math.max(filteredOptions.length, 1));
      }

      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        const option = filteredOptions[highlightedIndex];
        if (option) {
          const nextValues = value.includes(option.value)
            ? value.filter((item) => item !== option.value)
            : [...value, option.value];
          onChange(nextValues);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredOptions, highlightedIndex, isOpen, onChange, value]);

  const selectedOptions = options.filter((option) => value.includes(option.value));
  const selectedCount = selectedOptions.length;

  const toggleOption = (optionValue: string) => {
    const nextValues = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];
    onChange(nextValues);
  };

  const toggleAll = () => {
    if (selectedCount === options.length) {
      onChange([]);
      return;
    }

    onChange(options.map((option) => option.value));
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      setIsOpen((current) => !current);
    }
  };

  return (
    <div className="relative w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-left text-sm text-slate-200 shadow-sm transition hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {selectedCount === 0 ? (
            <span className="truncate text-slate-400">{placeholder}</span>
          ) : (
            <>
              {selectedOptions.slice(0, 2).map((option) => (
                <span key={option.value} className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-100">
                  {option.label}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleOption(option.value);
                    }}
                    aria-label={`Remove ${option.label}`}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {selectedCount > 2 ? <span className="text-xs font-semibold text-sky-300">+{selectedCount - 2} more</span> : null}
            </>
          )}
        </div>
        <ChevronDown className={`ml-2 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} size={18} />
      </div>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
          {searchable ? (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
              <Search size={16} className="text-slate-400" />
              <input
                id={inputId}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search options"
                className="w-full border-none bg-transparent outline-none placeholder:text-slate-500"
              />
            </div>
          ) : null}

          <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
            <input
              id="select-all"
              type="checkbox"
              checked={selectedCount === options.length && options.length > 0}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
            />
            <label htmlFor="select-all" className="cursor-pointer text-sm text-slate-200">
              Select all
            </label>
          </div>

          <div role="listbox" className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">No options found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const active = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-label={option.label}
                    aria-selected={active}
                    onClick={() => toggleOption(option.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition ${
                      highlightedIndex === index ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <span>{option.label}</span>
                    {active ? <Check size={16} className="text-sky-400" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MultiSelect;
