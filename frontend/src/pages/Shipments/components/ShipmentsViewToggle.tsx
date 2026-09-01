import type { ReactNode } from 'react';
import { LayoutGrid, List, Map } from 'lucide-react';

export type ShipmentsView = 'list' | 'kanban' | 'routeMap';

interface ShipmentsViewToggleProps {
  view: ShipmentsView;
  onViewChange: (view: ShipmentsView) => void;
}

const VIEW_OPTIONS: { value: ShipmentsView; label: string; icon: ReactNode }[] = [
  { value: 'list', label: 'List', icon: <List size={14} /> },
  { value: 'kanban', label: 'Kanban', icon: <LayoutGrid size={14} /> },
  { value: 'routeMap', label: 'Map', icon: <Map size={14} /> },
];

/**
 * Segmented toggle for the shipments list / kanban / route-map views.
 *
 * Extracted from the Shipments page (issue #635) — a classic
 * "God Component" decomposition target.
 */
export function ShipmentsViewToggle({ view, onViewChange }: ShipmentsViewToggleProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] p-0.5"
      role="group"
      aria-label="Toggle shipments view"
    >
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onViewChange(option.value)}
          aria-pressed={view === option.value}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            view === option.value
              ? 'bg-[#62ffff] text-black'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default ShipmentsViewToggle;