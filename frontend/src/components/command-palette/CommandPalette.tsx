import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocusTrap } from '@hooks/useFocusTrap';
import { Search, ArrowRight, X } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: 'navigation' | 'action';
  icon?: React.ReactNode;
  href?: string;
  onExecute?: () => void;
}

export interface CommandPaletteProps {
  /** Extra commands to merge with the built-in ones */
  extraCommands?: CommandItem[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ extraCommands = [] }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  // Ctrl+K / Cmd+K — must work globally, including when an input is focused,
  // so we use a direct window listener instead of useKeyboardShortcuts.
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Focus trap — handles Tab cycling and Escape via onEscape callback
  useFocusTrap(modalRef, isOpen, close);

  // Built-in commands
  const builtInCommands = useMemo<CommandItem[]>(
    () => [
      {
        id: 'nav-dashboard',
        label: 'Dashboard',
        description: 'Go to the main dashboard',
        category: 'navigation',
        href: '/dashboard',
      },
      {
        id: 'nav-shipments',
        label: 'Shipments',
        description: 'View all shipments',
        category: 'navigation',
        href: '/dashboard/shipments',
      },
      {
        id: 'nav-analytics',
        label: 'Analytics',
        description: 'View analytics and reports',
        category: 'navigation',
        href: '/dashboard/analytics',
      },
      {
        id: 'nav-settings',
        label: 'Settings',
        description: 'Manage your account settings',
        category: 'navigation',
        href: '/dashboard/settings',
      },
      {
        id: 'nav-notifications',
        label: 'Notifications',
        description: 'View your notifications',
        category: 'navigation',
        href: '/dashboard/notifications',
      },
      {
        id: 'nav-help-center',
        label: 'Help Center',
        description: 'Browse help articles and guides',
        category: 'navigation',
        href: '/dashboard/help-center',
      },
      {
        id: 'nav-blockchain-ledger',
        label: 'Blockchain Ledger',
        description: 'View on-chain transaction history',
        category: 'navigation',
        href: '/dashboard/blockchain-ledger',
      },
      {
        id: 'action-create-shipment',
        label: 'Create Shipment',
        description: 'Start a new shipment',
        category: 'action',
        onExecute: () => navigate('/dashboard/shipments/create'),
      },
    ],
    [navigate]
  );

  const allCommands = useMemo<CommandItem[]>(
    () => [...builtInCommands, ...extraCommands],
    [builtInCommands, extraCommands]
  );

  // Fuzzy search — case-insensitive substring match on label and description
  const filteredCommands = useMemo<CommandItem[]>(() => {
    if (!query.trim()) return allCommands;
    const lower = query.toLowerCase();
    return allCommands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        (cmd.description?.toLowerCase().includes(lower) ?? false)
    );
  }, [allCommands, query]);

  // Keep activeIndex in bounds when filtered list changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
  }, [filteredCommands.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(
      '[aria-selected="true"]'
    );
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Focus the input whenever the palette opens
  useEffect(() => {
    if (isOpen) {
      // useFocusTrap will focus the first focusable element (the input), but
      // we set it explicitly here as a reliable fallback.
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      if (cmd.onExecute) {
        cmd.onExecute();
      } else if (cmd.href) {
        navigate(cmd.href);
      }
      close();
    },
    [navigate, close]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[activeIndex]) {
            executeCommand(filteredCommands[activeIndex]);
          }
          break;
        default:
          break;
      }
    },
    [activeIndex, filteredCommands, executeCommand]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={close}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed inset-0 z-50 pointer-events-none"
        onKeyDown={handleKeyDown}
      >
        <div className="max-w-xl w-full mx-auto mt-[15vh] bg-[#0F1419] border border-[#1E2433] rounded-2xl shadow-xl pointer-events-auto overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2433]">
            <Search
              size={18}
              className="text-slate-400 flex-shrink-0"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="command-palette-listbox"
              aria-expanded={true}
              aria-activedescendant={
                filteredCommands[activeIndex]
                  ? `cmd-item-${filteredCommands[activeIndex].id}`
                  : undefined
              }
              placeholder="Search commands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Live region — announces result count to screen readers */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {query.trim()
              ? `${filteredCommands.length} command${filteredCommands.length !== 1 ? 's' : ''} found`
              : ''}
          </div>

          {/* Results list */}
          <ul
            id="command-palette-listbox"
            ref={listRef}
            role="listbox"
            aria-label="Commands"
            className="max-h-80 overflow-y-auto py-2"
          >
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={cmd.id}
                    id={`cmd-item-${cmd.id}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => executeCommand(cmd)}
                    className={[
                      'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                      'border-l-2',
                      isActive
                        ? 'bg-[rgba(0,217,255,0.08)] border-[#00D9FF]'
                        : 'border-transparent hover:bg-white/5',
                      // Visible focus ring when navigating by keyboard
                      isActive
                        ? 'ring-1 ring-inset ring-[#00D9FF]/30'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {/* Icon or default arrow */}
                    <span
                      className="flex-shrink-0 text-[#00D9FF] w-5 h-5 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {cmd.icon ?? <ArrowRight size={16} />}
                    </span>

                    {/* Label + description */}
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-sm text-white truncate">
                        {cmd.label}
                      </span>
                      {cmd.description && (
                        <span className="block text-xs text-slate-400 truncate">
                          {cmd.description}
                        </span>
                      )}
                    </span>

                    {/* Category badge */}
                    <span
                      className={[
                        'flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
                        cmd.category === 'action'
                          ? 'bg-[#00D9FF]/10 text-[#00D9FF]'
                          : 'bg-white/5 text-slate-400',
                      ].join(' ')}
                    >
                      {cmd.category}
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                No commands match &ldquo;{query}&rdquo;
              </li>
            )}
          </ul>

          {/* Footer hint */}
          <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-[#1E2433] text-xs text-slate-500">
            <span>Press Esc to close</span>
            <span aria-hidden="true">·</span>
            <span>↑↓ to navigate</span>
            <span aria-hidden="true">·</span>
            <span>Enter to run</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommandPalette;
