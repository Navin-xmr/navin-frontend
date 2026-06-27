import { SlidersHorizontal, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ShipmentStatus = 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type Priority = 'URGENT' | 'STANDARD' | 'ECONOMY';

export interface ShipmentFiltersValues {
  status: ShipmentStatus[];
  dateFrom: string;
  dateTo: string;
  carrier: string;
  origin: string;
  destination: string;
  weightMin: string;
  weightMax: string;
  priority: Priority[];
}

interface ShipmentFiltersProps {
  onFilterChange: (filters: ShipmentFiltersValues) => void;
}

const FILTER_KEYS: (keyof ShipmentFiltersValues)[] = [
  'status', 'dateFrom', 'dateTo', 'carrier', 'origin', 'destination',
  'weightMin', 'weightMax', 'priority',
];

const EMPTY_FILTERS: ShipmentFiltersValues = {
  status: [],
  dateFrom: '',
  dateTo: '',
  carrier: '',
  origin: '',
  destination: '',
  weightMin: '',
  weightMax: '',
  priority: [],
};

const STATUS_OPTIONS: ShipmentStatus[] = ['CREATED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
const PRIORITY_OPTIONS: Priority[] = ['URGENT', 'STANDARD', 'ECONOMY'];

function loadFiltersFromURL(sp: URLSearchParams): ShipmentFiltersValues {
  const csv = (key: string) => sp.get(key)?.split(',').filter(Boolean) ?? [];
  return {
    status: csv('status') as ShipmentStatus[],
    dateFrom: sp.get('dateFrom') ?? '',
    dateTo: sp.get('dateTo') ?? '',
    carrier: sp.get('carrier') ?? '',
    origin: sp.get('origin') ?? '',
    destination: sp.get('destination') ?? '',
    weightMin: sp.get('weightMin') ?? '',
    weightMax: sp.get('weightMax') ?? '',
    priority: csv('priority') as Priority[],
  };
}

function serializeToURL(sp: URLSearchParams, f: ShipmentFiltersValues): URLSearchParams {
  const next = new URLSearchParams();
  for (const [k, v] of sp.entries()) {
    if (!(FILTER_KEYS as readonly string[]).includes(k as keyof ShipmentFiltersValues)) {
      next.set(k, v);
    }
  }
  if (f.status.length) next.set('status', f.status.join(','));
  if (f.dateFrom) next.set('dateFrom', f.dateFrom);
  if (f.dateTo) next.set('dateTo', f.dateTo);
  if (f.carrier) next.set('carrier', f.carrier);
  if (f.origin) next.set('origin', f.origin);
  if (f.destination) next.set('destination', f.destination);
  if (f.weightMin) next.set('weightMin', f.weightMin);
  if (f.weightMax) next.set('weightMax', f.weightMax);
  if (f.priority.length) next.set('priority', f.priority.join(','));
  return next;
}

function countActive(f: ShipmentFiltersValues): number {
  let c = 0;
  if (f.status.length) c++;
  if (f.dateFrom || f.dateTo) c++;
  if (f.carrier) c++;
  if (f.origin) c++;
  if (f.destination) c++;
  if (f.weightMin || f.weightMax) c++;
  if (f.priority.length) c++;
  return c;
}

const inputBase =
  'w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] transition-colors';

const chipBase =
  'inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-medium transition-all';

const toggleChip = (active: boolean) =>
  `${chipBase} cursor-pointer ${
    active
      ? 'bg-[rgba(98,255,255,0.15)] text-[#62ffff] border-[#62ffff]'
      : 'bg-[rgba(19,186,186,0.05)] text-slate-300 border-[rgba(98,255,255,0.15)] hover:border-[#62ffff]'
  }`;

const ShipmentFilters: React.FC<ShipmentFiltersProps> = ({ onFilterChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ShipmentFiltersValues>(() => loadFiltersFromURL(searchParams));
  const [isOpen, setIsOpen] = useState(() => countActive(loadFiltersFromURL(searchParams)) > 0);
  const mounted = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipDebounce = useRef(false);

  const notify = useCallback(
    (f: ShipmentFiltersValues) => {
      onFilterChange(f);
      setSearchParams((prev) => serializeToURL(prev, f), { replace: true });
    },
    [onFilterChange, setSearchParams],
  );

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      notify(filters);
      return;
    }
    if (skipDebounce.current) {
      skipDebounce.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => notify(filters), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const immediate = useCallback((next: ShipmentFiltersValues) => {
    skipDebounce.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters(next);
    notify(next);
  }, [notify]);

  const activeCount = useMemo(() => countActive(filters), [filters]);

  const chips = useMemo(() => {
    const result: { key: string; label: string; onRemove: () => void }[] = [];

    const patch = (patch: Partial<ShipmentFiltersValues>) =>
      setFilters((prev) => ({ ...prev, ...patch }));

    if (filters.status.length) {
      result.push({
        key: 'status',
        label: `Status: ${filters.status.join(', ')}`,
        onRemove: () => patch({ status: [] }),
      });
    }
    if (filters.dateFrom || filters.dateTo) {
      result.push({
        key: 'date',
        label: `Date: ${filters.dateFrom || '…'} – ${filters.dateTo || '…'}`,
        onRemove: () => patch({ dateFrom: '', dateTo: '' }),
      });
    }
    if (filters.priority.length) {
      result.push({
        key: 'priority',
        label: `Priority: ${filters.priority.join(', ')}`,
        onRemove: () => patch({ priority: [] }),
      });
    }
    if (filters.origin) {
      result.push({
        key: 'origin',
        label: `Origin: ${filters.origin}`,
        onRemove: () => patch({ origin: '' }),
      });
    }
    if (filters.destination) {
      result.push({
        key: 'destination',
        label: `Destination: ${filters.destination}`,
        onRemove: () => patch({ destination: '' }),
      });
    }
    if (filters.carrier) {
      result.push({
        key: 'carrier',
        label: `Carrier: ${filters.carrier}`,
        onRemove: () => patch({ carrier: '' }),
      });
    }
    if (filters.weightMin || filters.weightMax) {
      result.push({
        key: 'weight',
        label: `Weight: ${filters.weightMin || '0'}–${filters.weightMax || '∞'}`,
        onRemove: () => patch({ weightMin: '', weightMax: '' }),
      });
    }

    return result;
  }, [filters]);

  const clearAll = () => immediate(EMPTY_FILTERS);

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
          isOpen || activeCount > 0
            ? 'bg-[rgba(98,255,255,0.1)] border border-[#62ffff] text-[#62ffff]'
            : 'bg-transparent border border-[rgba(98,255,255,0.3)] text-[#94a3b8] hover:text-white hover:border-[#62ffff]'
        }`}
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#62ffff] text-black text-xs font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Active Filter Chips */}
      {chips.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 mt-4"
          aria-label="Active filters"
        >
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[rgba(98,255,255,0.06)] border border-[rgba(98,255,255,0.2)] rounded-full text-xs text-[#62ffff] font-medium"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.15)] text-[#62ffff] hover:text-white transition-colors"
                aria-label={`Remove ${chip.key} filter`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <label
                    key={s}
                    className={toggleChip(filters.status.includes(s))}
                  >
                    <input
                      type="checkbox"
                      checked={filters.status.includes(s)}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          status: prev.status.includes(s)
                            ? prev.status.filter((v) => v !== s)
                            : [...prev.status, s],
                        }))
                      }
                      className="sr-only"
                    />
                    {s === 'CREATED' ? 'Created' : s === 'IN_TRANSIT' ? 'In Transit' : s === 'DELIVERED' ? 'Delivered' : 'Cancelled'}
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((p) => (
                  <label
                    key={p}
                    className={toggleChip(filters.priority.includes(p))}
                  >
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(p)}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          priority: prev.priority.includes(p)
                            ? prev.priority.filter((v) => v !== p)
                            : [...prev.priority, p],
                        }))
                      }
                      className="sr-only"
                    />
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                  }
                  className={`${inputBase} [color-scheme:dark]`}
                  aria-label="Date from"
                />
                <span className="text-slate-500 text-xs shrink-0">to</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className={`${inputBase} [color-scheme:dark]`}
                  aria-label="Date to"
                />
              </div>
            </div>

            {/* Origin */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                Origin City
              </label>
              <input
                type="text"
                value={filters.origin}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, origin: e.target.value }))
                }
                placeholder="Filter by origin…"
                className={inputBase}
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                Destination City
              </label>
              <input
                type="text"
                value={filters.destination}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, destination: e.target.value }))
                }
                placeholder="Filter by destination…"
                className={inputBase}
              />
            </div>

            {/* Carrier */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                Carrier
              </label>
              <input
                type="text"
                value={filters.carrier}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, carrier: e.target.value }))
                }
                placeholder="Filter by carrier…"
                className={inputBase}
              />
            </div>

            {/* Weight Range */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                Weight Range (kg)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={filters.weightMin}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, weightMin: e.target.value }))
                  }
                  placeholder="Min"
                  className={inputBase}
                />
                <span className="text-slate-500 text-xs shrink-0">to</span>
                <input
                  type="number"
                  min={0}
                  value={filters.weightMax}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, weightMax: e.target.value }))
                  }
                  placeholder="Max"
                  className={inputBase}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] flex justify-end">
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] rounded-lg transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShipmentFilters;
