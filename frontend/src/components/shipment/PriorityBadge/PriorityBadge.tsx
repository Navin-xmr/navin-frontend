import React, { useRef, useState } from 'react';
import type { ShipmentPriority } from '../../api/shipmentApi';

export interface PriorityBadgeProps {
  priority?: ShipmentPriority;
  editable?: boolean;
  onChangePriority?: (priority: ShipmentPriority) => void;
}

const PRIORITY_STYLES: Record<ShipmentPriority, string> = {
  URGENT: 'bg-red-500/10 text-red-400 border border-red-500/20',
  STANDARD: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  ECONOMY: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

const PRIORITIES: ShipmentPriority[] = ['URGENT', 'STANDARD', 'ECONOMY'];

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, editable = false, onChangePriority }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!priority) return null;

  const badge = (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );

  if (!editable) return badge;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="cursor-pointer"
      >
        {badge}
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-1 w-36 bg-[#1a2030] border border-white/10 rounded-xl shadow-xl overflow-hidden"
        >
          {PRIORITIES.map((p) => (
            <button
              key={p}
              role="option"
              aria-selected={p === priority}
              type="button"
              className="w-full text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-white/5 transition-colors"
              onClick={() => {
                onChangePriority?.(p);
                setOpen(false);
              }}
            >
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${PRIORITY_STYLES[p]}`}>{p}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityBadge;
