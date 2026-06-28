import React from 'react';
import { Download, RefreshCw, X } from 'lucide-react';

export interface BulkActionBarProps {
  count: number;
  onUpdateStatus: () => void;
  onExport: () => void;
  onClear: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  count,
  onUpdateStatus,
  onExport,
  onClear,
}) => {
  if (count === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0d1117] border border-[rgba(98,255,255,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
    >
      <span className="text-sm font-semibold text-[#62ffff] mr-1">
        {count} selected
      </span>

      <div className="w-px h-5 bg-[rgba(98,255,255,0.2)]" aria-hidden="true" />

      <button
        type="button"
        onClick={onUpdateStatus}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(98,255,255,0.1)] hover:bg-[rgba(98,255,255,0.2)] border border-[rgba(98,255,255,0.3)] text-sm font-medium text-white transition-colors cursor-pointer"
      >
        <RefreshCw size={14} />
        Update Status
      </button>

      <button
        type="button"
        onClick={onExport}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(98,255,255,0.1)] hover:bg-[rgba(98,255,255,0.2)] border border-[rgba(98,255,255,0.3)] text-sm font-medium text-white transition-colors cursor-pointer"
      >
        <Download size={14} />
        Export Selected
      </button>

      <div className="w-px h-5 bg-[rgba(98,255,255,0.2)]" aria-hidden="true" />

      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default BulkActionBar;
