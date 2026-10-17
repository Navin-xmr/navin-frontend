import React from 'react';
import { History } from 'lucide-react';

export interface DraftBannerProps {
  savedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
}

const DraftBanner: React.FC<DraftBannerProps> = ({ savedAt, onRestore, onDiscard }) => (
  <div
    className="flex items-center gap-3 p-4 mb-5 bg-blue-500/5 border border-blue-500/35 rounded-lg sm:flex-col sm:items-start"
    role="status"
  >
    <History size={18} className="text-blue-500 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="m-0 text-sm font-semibold text-slate-100">Unfinished shipment found</p>
      <p className="m-0 mt-0.5 text-xs text-slate-400">
        Saved {new Date(savedAt).toLocaleString()}
      </p>
    </div>
    <div className="flex gap-2 shrink-0 sm:w-full">
      <button
        type="button"
        className="bg-blue-600 border border-blue-600 text-white px-3.5 py-2 text-xs font-semibold rounded-md transition-all hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-[#62FFFF] focus-visible:outline-offset-2 sm:flex-1"
        onClick={onRestore}
      >
        Restore draft
      </button>
      <button
        type="button"
        className="bg-transparent border border-slate-800 text-slate-400 px-3.5 py-2 text-xs font-semibold rounded-md transition-all hover:border-slate-700 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-[#62FFFF] focus-visible:outline-offset-2 sm:flex-1"
        onClick={onDiscard}
      >
        Discard
      </button>
    </div>
  </div>
);

export default DraftBanner;
