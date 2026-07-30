import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ShipmentFilters from './ShipmentFilters';
import type { ShipmentFiltersValues } from './ShipmentFilters';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function renderFilters(onFilterChange = vi.fn()) {
  // Use real timers — userEvent works best without fake timers.
  // We flush debounced calls with waitFor() instead.
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <ShipmentFilters onFilterChange={onFilterChange} />
    </MemoryRouter>,
  );
  return { user, onFilterChange };
}

/** Click the "Filters" toggle button to open the filter panel. */
async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /filters/i }));
}

/** Wait for the 300 ms debounce to flush. */
const flushDebounce = () => new Promise<void>((r) => setTimeout(r, 350));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ShipmentFilters', () => {
  // ── 1. Renders without crashing ──────────────────────────────────────────
  it('renders the toggle button and calls onFilterChange on mount', () => {
    const onFilterChange = vi.fn();
    renderFilters(onFilterChange);

    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();

    // Component fires onFilterChange once on mount with empty/default filters
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining(EMPTY_FILTERS),
    );
  });

  // ── 2. Status filter change ───────────────────────────────────────────────
  it('calls onFilterChange with the selected status when a status chip is clicked', async () => {
    const { user, onFilterChange } = renderFilters();

    await openPanel(user);

    // The "In Transit" chip is a role=checkbox button
    const inTransitChip = screen.getByRole('checkbox', { name: /in transit/i });
    await user.click(inTransitChip);

    // Wait for the 300 ms debounce
    await act(flushDebounce);

    const calls = onFilterChange.mock.calls;
    const lastCall = calls[calls.length - 1][0] as ShipmentFiltersValues;
    expect(lastCall.status).toContain('IN_TRANSIT');
  });

  it('deselects a status chip when clicked a second time', async () => {
    const { user, onFilterChange } = renderFilters();

    await openPanel(user);

    const deliveredChip = screen.getByRole('checkbox', { name: /delivered/i });
    await user.click(deliveredChip);
    await act(flushDebounce);

    // Click again to deselect
    await user.click(deliveredChip);
    await act(flushDebounce);

    const calls = onFilterChange.mock.calls;
    const lastCall = calls[calls.length - 1][0] as ShipmentFiltersValues;
    expect(lastCall.status).not.toContain('DELIVERED');
  });

  // ── 3. Date range filter ──────────────────────────────────────────────────
  it('calls onFilterChange with dateFrom and dateTo after a date range is applied', async () => {
    const { user, onFilterChange } = renderFilters();

    await openPanel(user);

    // Open the DateRangePicker popover
    const datePickerTrigger = screen.getByRole('button', {
      name: /select date range/i,
    });
    await user.click(datePickerTrigger);

    // The dialog should be visible now
    expect(screen.getByRole('dialog', { name: /date range picker/i })).toBeInTheDocument();

    // Pick any two visible day buttons (the calendar renders many day buttons
    // with aria-label="MMMM d, yyyy"). Grab the first two enabled ones.
    const dayButtons = screen
      .getAllByRole('button', { name: /\w+ \d+, \d{4}/ })
      .filter((btn) => !btn.hasAttribute('disabled'));

    expect(dayButtons.length).toBeGreaterThanOrEqual(2);

    await user.click(dayButtons[0]); // start date
    await user.click(dayButtons[4]); // end date (a few days later)

    // Click Apply to commit the range
    await user.click(screen.getByRole('button', { name: /^apply$/i }));

    await act(flushDebounce);

    await waitFor(() => {
      const calls = onFilterChange.mock.calls;
      const lastCall = calls[calls.length - 1][0] as ShipmentFiltersValues;
      expect(lastCall.dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(lastCall.dateTo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ── 4. Clear filters ──────────────────────────────────────────────────────
  it('resets all filter values and calls onFilterChange with defaults when "Clear All Filters" is clicked', async () => {
    const { user, onFilterChange } = renderFilters();

    await openPanel(user);

    // Set a status filter first
    await user.click(screen.getByRole('checkbox', { name: /cancelled/i }));
    await act(flushDebounce);

    // Set a text filter
    const originInput = screen.getByPlaceholderText(/filter by origin/i);
    fireEvent.change(originInput, { target: { value: 'Singapore' } });
    await act(flushDebounce);

    // Clear all — this fires immediately (no debounce)
    await user.click(
      screen.getByRole('button', { name: /clear all filters/i }),
    );

    const calls = onFilterChange.mock.calls;
    const lastCall = calls[calls.length - 1][0] as ShipmentFiltersValues;
    expect(lastCall).toEqual(EMPTY_FILTERS);
  });

  it('removes individual filter chips and calls onFilterChange with updated values', async () => {
    const { user, onFilterChange } = renderFilters();

    await openPanel(user);

    // Activate a status filter so the chip strip appears
    await user.click(screen.getByRole('checkbox', { name: /created/i }));
    await act(flushDebounce);

    // The active-filters strip shows a chip with a remove button
    const removeBtn = screen.getByRole('button', { name: /remove status/i });
    await user.click(removeBtn);
    await act(flushDebounce);

    const calls = onFilterChange.mock.calls;
    const lastCall = calls[calls.length - 1][0] as ShipmentFiltersValues;
    expect(lastCall.status).toHaveLength(0);
  });

  // ── 5. Accessible labels ──────────────────────────────────────────────────
  it('exposes accessible labels for all interactive filter controls', async () => {
    const { user } = renderFilters();

    // The toggle button itself is accessible
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();

    await openPanel(user);

    // Status chips — role=checkbox with readable names
    expect(screen.getByRole('checkbox', { name: /created/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /in transit/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /delivered/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /cancelled/i })).toBeInTheDocument();

    // Priority chips
    expect(screen.getByRole('checkbox', { name: /urgent/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /standard/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /economy/i })).toBeInTheDocument();

    // Text inputs discoverable via placeholder
    expect(screen.getByPlaceholderText(/filter by origin/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/filter by destination/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/filter by carrier/i)).toBeInTheDocument();

    // Date range trigger
    expect(
      screen.getByRole('button', { name: /select date range/i }),
    ).toBeInTheDocument();

    // Clear All Filters button
    expect(
      screen.getByRole('button', { name: /clear all filters/i }),
    ).toBeInTheDocument();
  });

  // ── 6. Active-filter badge reflects active filter count ───────────────────
  // The "no results" state lives in the parent Shipments page, not in this
  // component. This test verifies the component communicates correctly when
  // filters are active — the badge count and the callback payload together
  // give the parent everything it needs to derive a "no results" state.
  it('shows an active-filter count badge when filters are applied', async () => {
    const { user } = renderFilters();

    await openPanel(user);

    // No badge yet
    expect(screen.queryByText('1')).not.toBeInTheDocument();

    // Activate one filter group (status)
    await user.click(screen.getByRole('checkbox', { name: /in transit/i }));
    await act(flushDebounce);

    // Badge showing count = 1 appears on the toggle button
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  // ── Bonus: Clear All chip-strip button also resets everything ─────────────
  it('resets filters via the "Clear All" chip-strip button', async () => {
    const { user, onFilterChange } = renderFilters();

    await openPanel(user);

    await user.click(screen.getByRole('checkbox', { name: /delivered/i }));
    await act(flushDebounce);

    // The chip strip "Clear All" (plain text button, not the panel button)
    const clearAllChipBtn = screen.getAllByRole('button', { name: /clear all/i });
    // There may be two: one in the chip strip and one in the panel.
    // The chip-strip one appears first in the DOM (above the panel).
    await user.click(clearAllChipBtn[0]);

    const calls = onFilterChange.mock.calls;
    const lastCall = calls[calls.length - 1][0] as ShipmentFiltersValues;
    expect(lastCall).toEqual(EMPTY_FILTERS);
  });
});
