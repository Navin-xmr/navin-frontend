import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, Plus, Check, X, Pencil, Trash2 } from 'lucide-react';
import { useSavedViews } from '@hooks/useSavedViews';
import type { SavedView } from '../../types/savedView';

export interface SavedViewsPanelProps {
  currentFilters: Record<string, unknown>;
  onLoad: (filters: Record<string, unknown>) => void;
  storageKey?: string;
}

const MAX_NAME_LENGTH = 50;

// ---------- Save row ----------
interface SaveRowProps {
  onSave: (name: string) => void;
}

function SaveRow({ onSave }: SaveRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setName('');
    setError(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setName('');
    setError(null);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setError(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`);
      return;
    }
    onSave(trimmed);
    setIsOpen(false);
    setName('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-[rgba(98,255,255,0.2)] bg-[rgba(19,186,186,0.05)] text-[#62ffff] text-sm font-medium hover:bg-[rgba(19,186,186,0.12)] hover:border-[rgba(98,255,255,0.4)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 focus:ring-offset-[#0F1419]"
        aria-label="Save current filters as a new view"
      >
        <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
        Save current filters
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="View name…"
          maxLength={MAX_NAME_LENGTH}
          aria-label="New saved view name"
          aria-describedby={error ? 'save-row-error' : undefined}
          aria-invalid={!!error}
          className="flex-1 min-w-0 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:border-[rgba(98,255,255,0.5)] transition-colors"
        />
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[rgba(0,217,255,0.15)] border border-[rgba(0,217,255,0.4)] text-[#00D9FF] text-sm font-medium hover:bg-[rgba(0,217,255,0.25)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 focus:ring-offset-[#0F1419] shrink-0"
          aria-label="Confirm save"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Save</span>
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#1E2433] text-white/50 text-sm hover:text-white hover:border-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 focus:ring-offset-[#0F1419] shrink-0"
          aria-label="Cancel saving"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </div>
      {error && (
        <p id="save-row-error" role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------- Single view row ----------
interface ViewRowProps {
  view: SavedView;
  onLoad: () => void;
  onRename: (name: string) => void;
  onRemove: () => void;
}

function ViewRow({ view, onLoad, onRename, onRemove }: ViewRowProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(view.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renaming]);

  // Keep local rename input in sync if the view name changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!renaming) setRenameName(view.name);
  }, [view.name, renaming]);

  const handleRenameStart = () => {
    setRenameName(view.name);
    setRenameError(null);
    setRenaming(true);
  };

  const handleRenameConfirm = () => {
    const trimmed = renameName.trim();
    if (!trimmed) {
      setRenameError('Name cannot be empty.');
      return;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setRenameError(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`);
      return;
    }
    onRename(trimmed);
    setRenaming(false);
    setRenameError(null);
  };

  const handleRenameCancel = () => {
    setRenaming(false);
    setRenameName(view.name);
    setRenameError(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameConfirm();
    if (e.key === 'Escape') handleRenameCancel();
  };

  if (renaming) {
    return (
      <li className="flex flex-col gap-2 p-3 rounded-lg bg-[rgba(19,186,186,0.04)] border border-[#1E2433]">
        <div className="flex gap-2">
          <input
            ref={renameInputRef}
            type="text"
            value={renameName}
            onChange={(e) => {
              setRenameName(e.target.value);
              if (renameError) setRenameError(null);
            }}
            onKeyDown={handleRenameKeyDown}
            maxLength={MAX_NAME_LENGTH}
            aria-label={`Rename view: ${view.name}`}
            aria-describedby={renameError ? `rename-error-${view.id}` : undefined}
            aria-invalid={!!renameError}
            className="flex-1 min-w-0 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:border-[rgba(98,255,255,0.5)] transition-colors"
          />
          <button
            type="button"
            onClick={handleRenameConfirm}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[rgba(0,217,255,0.15)] border border-[rgba(0,217,255,0.4)] text-[#00D9FF] text-sm hover:bg-[rgba(0,217,255,0.25)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 focus:ring-offset-[#0F1419] shrink-0"
            aria-label="Confirm rename"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleRenameCancel}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#1E2433] text-white/50 text-sm hover:text-white hover:border-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 focus:ring-offset-[#0F1419] shrink-0"
            aria-label="Cancel rename"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {renameError && (
          <p id={`rename-error-${view.id}`} role="alert" className="text-xs text-red-400">
            {renameError}
          </p>
        )}
      </li>
    );
  }

  if (confirmDelete) {
    return (
      <li className="flex flex-col gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/5">
        <p className="text-sm text-white/80">
          Delete <span className="font-medium text-white">"{view.name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0F1419]"
            aria-label={`Confirm delete view: ${view.name}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="px-3 py-1.5 rounded-lg border border-[#1E2433] text-white/50 text-sm hover:text-white hover:border-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 focus:ring-offset-[#0F1419]"
            aria-label="Cancel delete"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(19,186,186,0.04)] border border-[#1E2433] hover:border-[rgba(98,255,255,0.15)] transition-colors group">
      <span
        className="flex-1 min-w-0 text-sm text-white/90 truncate"
        title={view.name}
      >
        {view.name}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        {/* Load */}
        <button
          type="button"
          onClick={onLoad}
          className="px-2.5 py-1.5 rounded-lg bg-[rgba(0,217,255,0.1)] border border-[rgba(0,217,255,0.25)] text-[#00D9FF] text-xs font-medium hover:bg-[rgba(0,217,255,0.2)] hover:border-[rgba(0,217,255,0.5)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 focus:ring-offset-[#0F1419]"
          aria-label={`Load saved view: ${view.name}`}
        >
          Load
        </button>

        {/* Rename */}
        <button
          type="button"
          onClick={handleRenameStart}
          className="p-1.5 rounded-lg text-white/40 hover:text-[#62ffff] hover:bg-[rgba(98,255,255,0.08)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 focus:ring-offset-[#0F1419] opacity-0 group-hover:opacity-100"
          aria-label={`Rename view: ${view.name}`}
          title="Rename"
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0F1419] opacity-0 group-hover:opacity-100"
          aria-label={`Delete view: ${view.name}`}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

// ---------- Main panel ----------
export function SavedViewsPanel({
  currentFilters,
  onLoad,
  storageKey = 'navin_saved_views',
}: SavedViewsPanelProps) {
  const { views, save, load, rename, remove } = useSavedViews(storageKey);

  const handleLoad = (id: string) => {
    const view = load(id);
    if (view) {
      onLoad(view.filters);
    }
  };

  return (
    <section
      aria-label="Saved Views"
      className="bg-[#0F1419] border border-[#1E2433] rounded-xl p-4 flex flex-col gap-4"
    >
      {/* Heading */}
      <header className="flex items-center gap-2">
        <Bookmark
          className="w-4 h-4 text-[#00D9FF] shrink-0"
          aria-hidden="true"
        />
        <h2 className="text-sm font-semibold text-white tracking-wide">
          Saved Views
        </h2>
      </header>

      {/* Save row */}
      <SaveRow onSave={(name) => save(name, currentFilters)} />

      {/* Views list */}
      {views.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-4 px-2">
          No saved views yet. Apply filters and save them here.
        </p>
      ) : (
        <ul
          role="list"
          aria-label="Saved filter views"
          className="flex flex-col gap-2"
        >
          {views.map((view) => (
            <ViewRow
              key={view.id}
              view={view}
              onLoad={() => handleLoad(view.id)}
              onRename={(newName) => rename(view.id, newName)}
              onRemove={() => remove(view.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
