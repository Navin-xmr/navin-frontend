import { Loader2, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const hasMounted = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync external value changes (e.g., programmatic clear from parent)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce onChange — skip on initial mount to avoid double-firing on load
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      onChangeRef.current(inputValue);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [inputValue, debounceMs]);

  const handleClear = () => {
    setInputValue('');
    onChangeRef.current('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-3 bg-[#1f2937] border border-[#374151] rounded-lg px-4 py-2.5 flex-1 max-w-[400px]">
      <Search size={18} className="text-[#6b7280] shrink-0" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder:text-[#6b7280]"
      />
      {isLoading ? (
        <Loader2 size={16} className="text-[#6b7280] shrink-0 animate-spin" />
      ) : inputValue ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="text-[#6b7280] hover:text-white transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
};

export default SearchInput;
