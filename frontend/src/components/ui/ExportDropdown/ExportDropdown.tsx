import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

export type ExportFormat = 'csv' | 'json' | 'print';

export interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  formats?: ExportFormat[];
  dropUp?: boolean;
}

const formatConfig: Record<
  ExportFormat,
  { label: string; icon: React.ReactNode; description: string }
> = {
  csv: {
    label: 'CSV',
    icon: <FileSpreadsheet size={14} />,
    description: 'Spreadsheet-friendly comma-separated values',
  },
  json: {
    label: 'JSON',
    icon: <FileJson size={14} />,
    description: 'Structured data for developers and integrations',
  },
  print: {
    label: 'Print / PDF',
    icon: <FileText size={14} />,
    description: 'Formatted document for printing or saving as PDF',
  },
};

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExport,
  isLoading = false,
  disabled = false,
  label = 'Export',
  formats = ['csv', 'json', 'print'],
  dropUp = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Auto-close success after delay
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setStatus('idle'), 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false);
    setStatus('loading');
    try {
      await onExport(format);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, format?: ExportFormat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (format) {
        handleExport(format);
      } else {
        setIsOpen((prev) => !prev);
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isActive = isLoading || status === 'loading';

  const dropdownPositionClass = dropUp ? 'bottom-full mb-1' : 'mt-1';

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => !isActive && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => handleKeyDown(e)}
        disabled={disabled || isActive}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label} options`}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
          status === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : status === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-[rgba(19,186,186,0.05)] border-[rgba(98,255,255,0.2)] text-[#62ffff] hover:bg-[rgba(98,255,255,0.08)]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isActive ? (
          <Loader2 size={16} className="animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 size={16} />
        ) : status === 'error' ? (
          <AlertCircle size={16} />
        ) : (
          <Download size={16} />
        )}
        <span>
          {isActive
            ? 'Exporting…'
            : status === 'success'
              ? 'Exported!'
              : status === 'error'
                ? 'Failed'
                : label}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Export format"
          className={`absolute right-0 z-50 w-56 rounded-lg border border-[rgba(98,255,255,0.2)] bg-[#121620] shadow-lg shadow-black/40 py-1 overflow-hidden ${dropdownPositionClass}`}
        >
          {formats.map((format) => {
            const cfg = formatConfig[format];
            return (
              <li
                key={format}
                role="option"
                aria-selected={false}
                tabIndex={0}
                onClick={() => handleExport(format)}
                onKeyDown={(e) => handleKeyDown(e, format)}
                className="flex items-start gap-3 px-3 py-2.5 cursor-pointer text-sm text-slate-300 hover:bg-[rgba(98,255,255,0.06)] hover:text-white transition-colors"
              >
                <span className="text-[#62ffff] mt-0.5 shrink-0">{cfg.icon}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{cfg.label}</span>
                  <span className="text-xs text-slate-500">{cfg.description}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ExportDropdown;
