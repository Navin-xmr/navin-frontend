import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, X, ArrowRight, Loader2, Clock } from 'lucide-react';
import { shipmentApi } from '../../../api/shipmentApi';
import type { Shipment } from '../../../api/shipmentApi';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SearchResultType = 'shipment';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  status?: string;
  href: string;
}

export interface GlobalSearchProps {
  /** Placeholder shown inside the search bar */
  placeholder?: string;
  className?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RECENT_KEY = 'navin_recent_searches';
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

// ── Status colour helper ──────────────────────────────────────────────────────

function statusDot(status?: string): string {
  switch (status) {
    case 'IN_TRANSIT':
      return 'bg-accent-blue';
    case 'DELIVERED':
      return 'bg-accent-green';
    case 'CANCELLED':
      return 'bg-accent-red';
    default:
      return 'bg-text-secondary';
  }
}

function statusLabel(status?: string): string {
  switch (status) {
    case 'CREATED':
      return 'Created';
    case 'IN_TRANSIT':
      return 'In Transit';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status ?? '';
  }
}

// ── Recent search helpers ─────────────────────────────────────────────────────

function getRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function addRecent(query: string): void {
  try {
    const prev = getRecent().filter((q) => q !== query);
    localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...prev].slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

// ── Shipment → SearchResult mapper ───────────────────────────────────────────

function shipmentToResult(s: Shipment): SearchResult {
  return {
    id: s.id,
    type: 'shipment',
    title: `Shipment #${s.id}`,
    subtitle: `${s.origin} → ${s.destination}`,
    status: s.status,
    href: `/dashboard/shipments/${s.id}`,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = 'Search shipments… (Ctrl+K)',
  className = '',
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Open / close helpers ──────────────────────────────────────────────────

  const openSearch = useCallback(() => {
    setRecent(getRecent());
    setOpen(true);
    // Focus on next tick so the input is mounted
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults([]);
    setActiveIdx(-1);
  }, []);

  // ── Global keyboard shortcut ──────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const trigger = isMac ? e.metaKey : e.ctrlKey;
      if (trigger && e.key === 'k') {
        e.preventDefault();
        open ? closeSearch() : openSearch();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, openSearch, closeSearch]);

  // ── Close on outside click ────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeSearch]);

  // ── Search ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await shipmentApi.getAll({ limit: 50 });
        const q = trimmed.toLowerCase();
        const matched = data
          .filter(
            (s) =>
              s.id.toLowerCase().includes(q) ||
              s.origin.toLowerCase().includes(q) ||
              s.destination.toLowerCase().includes(q),
          )
          .slice(0, 8)
          .map(shipmentToResult);
        setResults(matched);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const trimmedQuery = query.trim();
  // Results/loading only reflect the current query; once it's cleared, the
  // previous search's state is stale and shouldn't be shown.
  const displayResults = trimmedQuery ? results : [];
  const displayLoading = trimmedQuery ? loading : false;

  const allItems = trimmedQuery ? displayResults : recent.map((r) => ({ id: r, recent: true }));
  const itemCount = allItems.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % itemCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + itemCount) % itemCount);
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      if (trimmedQuery) {
        const result = displayResults[activeIdx];
        if (result) navigateTo(result);
      } else {
        const r = recent[activeIdx];
        if (r) setQuery(r);
      }
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  // ── Navigate ──────────────────────────────────────────────────────────────

  const navigateTo = (result: SearchResult) => {
    addRecent(query.trim() || result.title);
    closeSearch();
    navigate(result.href);
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const showPanel = open;
  const showRecent = open && !trimmedQuery && recent.length > 0;
  const showResults = open && trimmedQuery.length > 0;
  const noResults = showResults && !displayLoading && displayResults.length === 0;

  return (
    <>
      {/* ── Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* ── Search container ── */}
      <div
        ref={panelRef}
        className={`relative z-50 ${className}`}
        role="search"
        aria-label="Global search"
      >
        {/* Trigger bar */}
        <button
          type="button"
          onClick={openSearch}
          aria-label="Open global search"
          className={`flex items-center gap-3 h-10 px-4 rounded-[10px] border transition-colors w-full max-w-lg ${
            open
              ? 'border-accent-blue bg-background-elevated'
              : 'bg-gray-100 dark:bg-[#111624] border-gray-200 dark:border-slate-800 hover:border-accent-blue/60'
          }`}
        >
          <Search size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
          <span className="flex-1 text-left text-sm text-gray-400 dark:text-slate-500 truncate">
            {placeholder}
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono border border-gray-300 dark:border-slate-700 rounded text-gray-400 dark:text-slate-500 bg-transparent">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Dropdown panel */}
        {showPanel && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background-elevated border border-border rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in-up min-w-[320px]">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              {displayLoading ? (
                <Loader2 size={16} className="shrink-0 text-accent-blue animate-spin" />
              ) : (
                <Search size={16} className="shrink-0 text-text-secondary" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search by ID, origin, destination…"
                className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-secondary"
                aria-autocomplete="list"
                aria-controls="global-search-results"
                aria-activedescendant={
                  activeIdx >= 0 ? `gs-item-${activeIdx}` : undefined
                }
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                  className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Recent searches */}
            {showRecent && (
              <div className="py-2">
                <p className="px-4 py-1 text-[10px] uppercase tracking-widest text-text-secondary font-semibold">
                  Recent
                </p>
                <ul role="listbox" id="global-search-results">
                  {recent.map((q, i) => (
                    <li key={q} id={`gs-item-${i}`} role="option" aria-selected={activeIdx === i}>
                      <button
                        type="button"
                        onClick={() => handleRecentClick(q)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                          activeIdx === i
                            ? 'bg-background-card text-white'
                            : 'text-text-primary hover:bg-background-card'
                        }`}
                      >
                        <Clock size={14} className="shrink-0 text-text-secondary" />
                        <span className="flex-1 truncate">{q}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Results */}
            {showResults && (
              <ul
                id="global-search-results"
                role="listbox"
                className="py-2 max-h-72 overflow-y-auto"
              >
                {displayResults.map((result, i) => (
                  <li
                    key={result.id}
                    id={`gs-item-${i}`}
                    role="option"
                    aria-selected={activeIdx === i}
                  >
                    <button
                      type="button"
                      onClick={() => navigateTo(result)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group ${
                        activeIdx === i
                          ? 'bg-background-card'
                          : 'hover:bg-background-card'
                      }`}
                    >
                      {/* Icon */}
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-blue/10 text-accent-blue shrink-0">
                        <Package size={15} />
                      </span>

                      {/* Text */}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {result.title}
                          </span>
                          {result.status && (
                            <span className="flex items-center gap-1 shrink-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusDot(result.status)}`}
                              />
                              <span className="text-[10px] text-text-secondary font-medium">
                                {statusLabel(result.status)}
                              </span>
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-text-secondary truncate block">
                          {result.subtitle}
                        </span>
                      </span>

                      {/* Arrow */}
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* No results */}
            {noResults && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-4">
                <Search size={28} className="text-text-secondary opacity-40" />
                <p className="text-sm text-text-secondary">
                  No results for <span className="text-text-primary font-medium">"{query}"</span>
                </p>
                <p className="text-xs text-text-secondary opacity-60">
                  Try a different shipment ID, origin, or destination.
                </p>
              </div>
            )}

            {/* Loading */}
            {displayLoading && displayResults.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-8 text-text-secondary text-sm">
                <Loader2 size={16} className="animate-spin" />
                Searching…
              </div>
            )}

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[10px] text-text-secondary">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 border border-border rounded text-[9px] bg-background-card">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 border border-border rounded text-[9px] bg-background-card">↵</kbd>
                Open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 border border-border rounded text-[9px] bg-background-card">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalSearch;
