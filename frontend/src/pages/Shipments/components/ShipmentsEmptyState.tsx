interface ShipmentsEmptyStateProps {
  error: string | null;
  isEmpty: boolean;
  isFilterEmpty: boolean;
  onClearFilters: () => void;
}

/**
 * Error / empty / no-matches states for the shipments list.
 *
 * Extracted from the Shipments page (issue #635).
 */
export function ShipmentsEmptyState({
  error,
  isEmpty,
  isFilterEmpty,
  onClearFilters,
}: ShipmentsEmptyStateProps) {
  if (error) {
    return (
      <div className="py-8 px-6 text-center text-[var(--text-secondary)]" role="alert">
        {error}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-8 px-6 text-center text-[var(--text-secondary)]">
        <h3>No shipments available</h3>
        <p>There are no shipments to show.</p>
      </div>
    );
  }

  if (isFilterEmpty) {
    return (
      <div className="py-8 px-6 text-center text-[var(--text-secondary)]">
        <h3>No results found</h3>
        <p>No shipments match the selected filters.</p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-transparent border border-[rgba(98,255,255,0.3)] rounded-lg text-[#62ffff] text-sm font-medium cursor-pointer transition-colors hover:bg-[rgba(98,255,255,0.08)] hover:border-[rgba(98,255,255,0.5)]"
          onClick={onClearFilters}
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return null;
}

export default ShipmentsEmptyState;