import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const getAllMock = vi.fn();

vi.mock('../../../api/shipmentApi', async () => {
  const actual = await vi.importActual<typeof import('../../../api/shipmentApi')>(
    '../../../api/shipmentApi',
  );
  return {
    ...actual,
    shipmentApi: { ...actual.shipmentApi, getAll: (...args: unknown[]) => getAllMock(...args) },
  };
});

// ── Helpers ────────────────────────────────────────────────────────────────────

const RECENT_KEY = 'navin_recent_searches';

function renderSearch(props = {}) {
  return render(
    <BrowserRouter>
      <GlobalSearch {...props} />
    </BrowserRouter>,
  );
}

function makeShipments(overrides: Partial<{ id: string; origin: string; destination: string; status: string }>[] = []) {
  return overrides.map((o, i) => ({
    id: o.id ?? `ship-${i}`,
    origin: o.origin ?? 'London',
    destination: o.destination ?? 'Paris',
    status: o.status ?? 'IN_TRANSIT',
    createdAt: '2026-01-01T00:00:00Z',
  }));
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('GlobalSearch', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getAllMock.mockReset();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial render ───────────────────────────────────────────────────────────

  it('renders the trigger bar with default placeholder', () => {
    renderSearch();
    expect(screen.getByRole('button', { name: /open global search/i })).toBeInTheDocument();
    expect(screen.getByText(/ctrl\+k/i)).toBeInTheDocument();
  });

  it('accepts a custom placeholder', () => {
    renderSearch({ placeholder: 'Find a package…' });
    expect(screen.getByText('Find a package…')).toBeInTheDocument();
  });

  it('does not show the search panel on first render', () => {
    renderSearch();
    expect(screen.queryByPlaceholderText(/search by id/i)).not.toBeInTheDocument();
  });

  // ── Opening / closing ────────────────────────────────────────────────────────

  it('opens the panel when the trigger button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    expect(screen.getByPlaceholderText(/search by id/i)).toBeInTheDocument();
  });

  it('shows a backdrop overlay when open', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('closes the panel when Escape is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.keyboard('{Escape}');
    expect(screen.queryByPlaceholderText(/search by id/i)).not.toBeInTheDocument();
  });

  it('closes the panel on outside click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.click(document.body);
    expect(screen.queryByPlaceholderText(/search by id/i)).not.toBeInTheDocument();
  });

  it('opens/closes with Ctrl+K keyboard shortcut', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderSearch();
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByPlaceholderText(/search by id/i)).toBeInTheDocument();
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByPlaceholderText(/search by id/i)).not.toBeInTheDocument();
  });

  // ── Search flow ──────────────────────────────────────────────────────────────

  it('calls shipmentApi.getAll after debounce and renders results', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    getAllMock.mockResolvedValue({
      data: makeShipments([{ id: 'ABC123', origin: 'Madrid', destination: 'Berlin', status: 'IN_TRANSIT' }]),
      meta: { page: 1, limit: 50, total: 1 },
    });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'ABC');

    // Flush debounce
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(getAllMock).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
    });
    await waitFor(() => {
      expect(screen.getByText('Shipment #ABC123')).toBeInTheDocument();
    });
    expect(screen.getByText('Madrid → Berlin')).toBeInTheDocument();
    expect(screen.getByText(/in transit/i)).toBeInTheDocument();
  });

  it('filters results by origin/destination match', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    getAllMock.mockResolvedValue({
      data: makeShipments([
        { id: 'S1', origin: 'Tokyo', destination: 'Seoul' },
        { id: 'S2', origin: 'Rome', destination: 'Athens' },
      ]),
      meta: { page: 1, limit: 50, total: 2 },
    });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'tokyo');
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(screen.getByText('Shipment #S1')).toBeInTheDocument());
    expect(screen.queryByText('Shipment #S2')).not.toBeInTheDocument();
  });

  it('shows loading spinner while fetching', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // Never resolves during this test
    getAllMock.mockReturnValue(new Promise(() => {}));

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'xyz');
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it('navigates to the shipment detail page when a result is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    getAllMock.mockResolvedValue({
      data: makeShipments([{ id: 'NAV-9', origin: 'Oslo', destination: 'Helsinki' }]),
      meta: { page: 1, limit: 50, total: 1 },
    });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'NAV');
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(screen.getByText('Shipment #NAV-9')).toBeInTheDocument());
    await user.click(screen.getByText('Shipment #NAV-9'));

    expect(navigateMock).toHaveBeenCalledWith('/dashboard/shipments/NAV-9');
    // Panel closes after navigation
    expect(screen.queryByPlaceholderText(/search by id/i)).not.toBeInTheDocument();
  });

  it('clears results and closes panel after navigation, saving to recent searches', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    getAllMock.mockResolvedValue({
      data: makeShipments([{ id: 'R1' }]),
      meta: { page: 1, limit: 50, total: 1 },
    });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'R1');
    vi.advanceTimersByTime(300);
    await waitFor(() => expect(screen.getByText('Shipment #R1')).toBeInTheDocument());
    await user.click(screen.getByText('Shipment #R1'));

    const stored = JSON.parse(localStorage.getItem('navin_recent_searches') ?? '[]');
    expect(stored).toContain('R1');
  });

  // ── Empty / error states ─────────────────────────────────────────────────────

  it('shows a "no results" message when the query matches nothing', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    getAllMock.mockResolvedValue({
      data: makeShipments([{ id: 'SHIP-1', origin: 'Cairo', destination: 'Dubai' }]),
      meta: { page: 1, limit: 50, total: 1 },
    });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'zzznomatch');
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(screen.getByText(/no results for/i)).toBeInTheDocument());
    expect(screen.getByText(/"zzznomatch"/i)).toBeInTheDocument();
  });

  it('shows no results message when the API rejects', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    getAllMock.mockRejectedValue(new Error('Network Error'));

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'fail');
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(screen.getByText(/no results for/i)).toBeInTheDocument());
  });

  // ── Clear button ─────────────────────────────────────────────────────────────

  it('renders a clear button when query is non-empty, and clicking it clears the input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    getAllMock.mockResolvedValue({ data: [], meta: { page: 1, limit: 50, total: 0 } });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'something');
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear search/i }));
    expect((screen.getByPlaceholderText(/search by id/i) as HTMLInputElement).value).toBe('');
  });

  // ── Recent searches ──────────────────────────────────────────────────────────

  it('shows recent searches when panel opens and query is empty', async () => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(['Lagos', 'Nairobi']));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));

    expect(screen.getByText('Lagos')).toBeInTheDocument();
    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });

  it('clicking a recent item fills the input and triggers a new search', async () => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(['Cape Town']));
    getAllMock.mockResolvedValue({
      data: makeShipments([{ id: 'CT-1', origin: 'Cape Town', destination: 'Jo\'burg' }]),
      meta: { page: 1, limit: 50, total: 1 },
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.click(screen.getByText('Cape Town'));

    // Input value should now be the recent query
    expect((screen.getByPlaceholderText(/search by id/i) as HTMLInputElement).value).toBe('Cape Town');

    vi.advanceTimersByTime(300);
    await waitFor(() => expect(getAllMock).toHaveBeenCalled());
  });

  // ── Keyboard navigation ──────────────────────────────────────────────────────

  it('highlights results with arrow keys and opens the selected one on Enter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    getAllMock.mockResolvedValue({
      data: makeShipments([
        { id: 'K1', origin: 'A', destination: 'B' },
        { id: 'K2', origin: 'C', destination: 'D' },
      ]),
      meta: { page: 1, limit: 50, total: 2 },
    });

    renderSearch();
    await user.click(screen.getByRole('button', { name: /open global search/i }));
    await user.type(screen.getByPlaceholderText(/search by id/i), 'K');
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(screen.getByText('Shipment #K1')).toBeInTheDocument());

    const input = screen.getByPlaceholderText(/search by id/i);
    await user.type(input, '{ArrowDown}'); // index 0 → K1
    await user.type(input, '{ArrowDown}'); // index 1 → K2
    await user.type(input, '{Enter}');

    expect(navigateMock).toHaveBeenCalledWith('/dashboard/shipments/K2');
  });
});
