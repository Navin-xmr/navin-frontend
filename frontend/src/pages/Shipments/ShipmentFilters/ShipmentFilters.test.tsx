import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 1. Renders without crashing ────────────────────────────────────────────
  describe('initial render', () => {
    it('renders the Filters toggle button', () => {
      renderFilters();
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('calls onFilterChange once on mount with empty/default filters', () => {
      const onFilterChange = vi.fn();
      renderFilters(onFilterChange);

      expect(onFilterChange).toHaveBeenCalledTimes(1);
      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining(EMPTY_FILTERS),
      );
    });

    it('does not render the filter panel before the toggle is clicked', () => {
      renderFilters();
      // Panel-only content should not be visible initially
      expect(screen.queryByPlaceholderText(/filter by origin/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/filter by carrier/i)).not.toBeInTheDocument();
    });

    it('does not show active-filter chips on mount', () => {
      renderFilters();
      expect(screen.queryByLabelText('Active filters')).not.toBeInTheDocument();
    });

    it('opens the filter panel when the toggle button is clicked', async () => {
      const { user } = renderFilters();
      await openPanel(user);
      expect(screen.getByPlaceholderText(/filter by origin/i)).toBeInTheDocument();
    });

    it('closes the filter panel when the toggle button is clicked again', async () => {
      const { user } = renderFilters();
      await openPanel(user);
      // Click the toggle again — use getAllByRole since the panel may now
      // contain other buttons whose accessible name matches /filters/i
      const toggleButtons = screen.getAllByRole('button', { name: /^filters$/i });
      await user.click(toggleButtons[0]);
      expect(screen.queryByPlaceholderText(/filter by origin/i)).not.toBeInTheDocument();
    });
  });

  // ── 2. Status filter change ────────────────────────────────────────────────
  describe('status filter', () => {
    it('calls onFilterChange with the selected status when a status chip is clicked', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /in transit/i }));
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.status).toContain('IN_TRANSIT');
    });

    it('allows multiple statuses to be selected simultaneously', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /in transit/i }));
      await act(flushDebounce);
      await user.click(screen.getByRole('checkbox', { name: /delivered/i }));
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.status).toContain('IN_TRANSIT');
      expect(lastCall.status).toContain('DELIVERED');
    });

    it('deselects a status chip when clicked a second time', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      const deliveredChip = screen.getByRole('checkbox', { name: /delivered/i });
      await user.click(deliveredChip);
      await act(flushDebounce);

      await user.click(deliveredChip);
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.status).not.toContain('DELIVERED');
    });

    it('marks the status chip as checked via aria-checked when selected', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      const chip = screen.getByRole('checkbox', { name: /cancelled/i });
      expect(chip).toHaveAttribute('aria-checked', 'false');

      await user.click(chip);
      await act(flushDebounce);

      expect(chip).toHaveAttribute('aria-checked', 'true');
    });
  });

  // ── 3. Date range filter ───────────────────────────────────────────────────
  describe('date range filter', () => {
    it('calls onFilterChange with dateFrom and dateTo after a date range is applied', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('button', { name: /select date range/i }));
      expect(screen.getByRole('dialog', { name: /date range picker/i })).toBeInTheDocument();

      const dayButtons = screen
        .getAllByRole('button', { name: /\w+ \d+, \d{4}/ })
        .filter((btn) => !btn.hasAttribute('disabled'));

      expect(dayButtons.length).toBeGreaterThanOrEqual(5);

      await user.click(dayButtons[0]);
      await user.click(dayButtons[4]);
      await user.click(screen.getByRole('button', { name: /^apply$/i }));
      await act(flushDebounce);

      await waitFor(() => {
        const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
        expect(lastCall.dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(lastCall.dateTo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('closes the date picker dialog after Apply is clicked', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('button', { name: /select date range/i }));
      expect(screen.getByRole('dialog', { name: /date range picker/i })).toBeInTheDocument();

      const dayButtons = screen
        .getAllByRole('button', { name: /\w+ \d+, \d{4}/ })
        .filter((btn) => !btn.hasAttribute('disabled'));
      await user.click(dayButtons[0]);
      await user.click(screen.getByRole('button', { name: /^apply$/i }));

      expect(screen.queryByRole('dialog', { name: /date range picker/i })).not.toBeInTheDocument();
    });

    it('does not update filters before Apply is clicked', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('button', { name: /select date range/i }));

      const dayButtons = screen
        .getAllByRole('button', { name: /\w+ \d+, \d{4}/ })
        .filter((btn) => !btn.hasAttribute('disabled'));
      await user.click(dayButtons[0]);
      // Do NOT click Apply

      await act(flushDebounce);

      // onFilterChange should not have been called with a dateFrom yet
      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.dateFrom).toBe('');
    });
  });

  // ── 4. Text field filters ──────────────────────────────────────────────────
  describe('text field filters', () => {
    it('calls onFilterChange with the entered origin value', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      const originInput = screen.getByPlaceholderText(/filter by origin/i);
      fireEvent.change(originInput, { target: { value: 'Singapore' } });
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.origin).toBe('Singapore');
    });

    it('calls onFilterChange with the entered destination value', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      fireEvent.change(
        screen.getByPlaceholderText(/filter by destination/i),
        { target: { value: 'Rotterdam' } },
      );
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.destination).toBe('Rotterdam');
    });

    it('calls onFilterChange with the entered carrier value', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      fireEvent.change(
        screen.getByPlaceholderText(/filter by carrier/i),
        { target: { value: 'Maersk' } },
      );
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.carrier).toBe('Maersk');
    });

    it('calls onFilterChange with min and max weight values', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      fireEvent.change(screen.getByPlaceholderText(/^min$/i), { target: { value: '10' } });
      fireEvent.change(screen.getByPlaceholderText(/^max$/i), { target: { value: '500' } });
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.weightMin).toBe('10');
      expect(lastCall.weightMax).toBe('500');
    });
  });

  // ── 5. Clear filters ───────────────────────────────────────────────────────
  describe('clear filters', () => {
    it('resets all values and calls onFilterChange with defaults via "Clear All Filters" panel button', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /cancelled/i }));
      await act(flushDebounce);

      fireEvent.change(
        screen.getByPlaceholderText(/filter by origin/i),
        { target: { value: 'Singapore' } },
      );
      await act(flushDebounce);

      await user.click(screen.getByRole('button', { name: /clear all filters/i }));

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall).toEqual(EMPTY_FILTERS);
    });

    it('removes the active-filter chip strip after clearing all filters', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /delivered/i }));
      await act(flushDebounce);

      expect(screen.getByLabelText('Active filters')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /clear all filters/i }));

      expect(screen.queryByLabelText('Active filters')).not.toBeInTheDocument();
    });

    it('resets filters via the chip-strip "Clear All" button', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /delivered/i }));
      await act(flushDebounce);

      // chip-strip Clear All appears first in the DOM (above the panel)
      const clearAllBtns = screen.getAllByRole('button', { name: /^clear all$/i });
      await user.click(clearAllBtns[0]);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall).toEqual(EMPTY_FILTERS);
    });

    it('removes an individual filter via its chip remove button', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /created/i }));
      await act(flushDebounce);

      const removeBtn = screen.getByRole('button', { name: /remove status/i });
      await user.click(removeBtn);
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.status).toHaveLength(0);
    });
  });

  // ── 6. Accessible labels ───────────────────────────────────────────────────
  describe('accessibility', () => {
    it('toggle button has an accessible name', () => {
      renderFilters();
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('all status chips are exposed as checkboxes with readable names', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      expect(screen.getByRole('checkbox', { name: /created/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /in transit/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /delivered/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /cancelled/i })).toBeInTheDocument();
    });

    it('all priority chips are exposed as checkboxes with readable names', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      expect(screen.getByRole('checkbox', { name: /urgent/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /standard/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /economy/i })).toBeInTheDocument();
    });

    it('text inputs are discoverable via placeholder text', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      expect(screen.getByPlaceholderText(/filter by origin/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/filter by destination/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/filter by carrier/i)).toBeInTheDocument();
    });

    it('date range trigger button is accessible', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      expect(
        screen.getByRole('button', { name: /select date range/i }),
      ).toBeInTheDocument();
    });

    it('active filters chip strip has an aria-label', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /in transit/i }));
      await act(flushDebounce);

      expect(screen.getByLabelText('Active filters')).toBeInTheDocument();
    });

    it('chip remove buttons have descriptive aria-labels', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /created/i }));
      await act(flushDebounce);

      expect(
        screen.getByRole('button', { name: /remove status/i }),
      ).toBeInTheDocument();
    });
  });

  // ── 7. Active filter count badge ───────────────────────────────────────────
  describe('active filter count badge', () => {
    it('shows no badge when no filters are active', async () => {
      const { user } = renderFilters();
      await openPanel(user);
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('shows badge count of 1 when one filter group is active', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /in transit/i }));
      await act(flushDebounce);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('increments badge count as more filter groups are activated', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /in transit/i }));
      await act(flushDebounce);
      expect(screen.getByText('1')).toBeInTheDocument();

      fireEvent.change(
        screen.getByPlaceholderText(/filter by origin/i),
        { target: { value: 'Lagos' } },
      );
      await act(flushDebounce);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('removes the badge when filters are cleared', async () => {
      const { user } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /delivered/i }));
      await act(flushDebounce);
      expect(screen.getByText('1')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /clear all filters/i }));
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });
  });

  // ── 8. Priority filter ─────────────────────────────────────────────────────
  describe('priority filter', () => {
    it('calls onFilterChange with the selected priority', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /urgent/i }));
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.priority).toContain('URGENT');
    });

    it('allows multiple priorities to be selected', async () => {
      const { user, onFilterChange } = renderFilters();
      await openPanel(user);

      await user.click(screen.getByRole('checkbox', { name: /urgent/i }));
      await act(flushDebounce);
      await user.click(screen.getByRole('checkbox', { name: /economy/i }));
      await act(flushDebounce);

      const lastCall = onFilterChange.mock.calls.at(-1)![0] as ShipmentFiltersValues;
      expect(lastCall.priority).toContain('URGENT');
      expect(lastCall.priority).toContain('ECONOMY');
    });
  });
});
