import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Shipments from './Shipments';
import type { Shipment, ShipmentsResponse } from '../../api/shipmentApi';

const api = vi.hoisted(() => ({
  getAll: vi.fn(),
  bulkUpdateStatus: vi.fn(),
}));

vi.mock('../../api/shipmentApi', () => ({ shipmentApi: api }));
vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
// Import the two hooks the page needs directly instead of through the barrel,
// which also pulls in unrelated auth code.
vi.mock('../../hooks', async () => ({
  useBulkSelection: (await import('../../hooks/useBulkSelection')).useBulkSelection,
  useDebounce: (await import('../../hooks/useDebounce')).useDebounce,
}));
vi.mock('./KanbanView/ShipmentsKanban', () => ({ default: () => null }));
vi.mock('./RouteMap/RouteMap', () => ({ default: () => null }));

function makeShipment(id: string, status: Shipment['status'] = 'DELIVERED'): Shipment {
  return {
    id,
    origin: 'Lagos',
    destination: 'Abuja',
    status,
    createdAt: '2026-08-01T10:00:00.000Z',
  };
}

function page(data: Shipment[], total: number, pageNumber = 1): ShipmentsResponse {
  return { data, meta: { page: pageNumber, limit: 50, total } };
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="search">{location.search}</div>;
}

function renderPage(initialEntry = '/dashboard/shipments') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Shipments />
      <LocationProbe />
    </MemoryRouter>,
  );
}

/** Normalises the single-or-list `status` argument of the last API call. */
function lastCall() {
  const calls = api.getAll.mock.calls;
  return calls[calls.length - 1][0] as Record<string, unknown>;
}

function asList(value: unknown): unknown[] {
  return value === undefined ? [] : ([] as unknown[]).concat(value);
}

/** Simulates scrolling the virtualised list to the bottom (loads the next page). */
function scrollListToBottom() {
  const list = screen.getByRole('table', { name: 'Shipments list' }).parentElement!;
  fireEvent.scroll(list);
}

describe('Shipments filters and totals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    api.getAll.mockResolvedValue(page([makeShipment('SHP-1')], 1));
  });

  it('keeps the status filter active when moving to page 2 and reports the filtered total', async () => {
    const user = userEvent.setup();
    // 3 delivered shipments exist across 2 pages, out of many more overall.
    api.getAll.mockImplementation(async (params: { page?: number }) =>
      params.page === 2
        ? page([makeShipment('SHP-3')], 3, 2)
        : page([makeShipment('SHP-1'), makeShipment('SHP-2')], 3, 1),
    );
    renderPage();
    await screen.findByText(/of 1 shipments|of 3 shipments/);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by status' }), 'DELIVERED');

    await waitFor(() => {
      expect(asList(lastCall().status)).toEqual(['DELIVERED']);
      expect(lastCall().page).toBe(1);
    });
    expect(await screen.findByText('Showing 2 of 3 shipments')).toBeInTheDocument();
    expect(screen.getByTestId('search')).toHaveTextContent('status=DELIVERED');

    scrollListToBottom();

    await waitFor(() => expect(lastCall().page).toBe(2));
    // The filter travelled with the page-2 request and the URL still carries it.
    expect(asList(lastCall().status)).toEqual(['DELIVERED']);
    expect(screen.getByTestId('search')).toHaveTextContent('status=DELIVERED');
    expect(screen.getByTestId('search')).toHaveTextContent('page=2');
    // Total is the server's filtered count, not the count of every shipment.
    expect(await screen.findByText('Showing 3 of 3 shipments')).toBeInTheDocument();
  });

  it('goes back to page 1 when a filter changes while on a later page', async () => {
    const user = userEvent.setup();
    api.getAll.mockImplementation(async (params: { page?: number }) =>
      params.page === 2
        ? page([makeShipment('SHP-3')], 3, 2)
        : page([makeShipment('SHP-1'), makeShipment('SHP-2')], 3, 1),
    );
    renderPage();
    await screen.findByText('Showing 2 of 3 shipments');

    scrollListToBottom();
    await waitFor(() => expect(lastCall().page).toBe(2));

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by priority' }), 'URGENT');

    await waitFor(() => {
      expect(lastCall().page).toBe(1);
      expect(asList(lastCall().priority)).toEqual(['URGENT']);
    });
    expect(screen.getByTestId('search')).not.toHaveTextContent('page=');
  });

  it('restores the filter from the URL on first load', async () => {
    renderPage('/dashboard/shipments?status=DELIVERED');

    await waitFor(() => expect(asList(lastCall().status)).toEqual(['DELIVERED']));
  });

  it('sends the advanced carrier and weight filters to the API', async () => {
    renderPage('/dashboard/shipments?carrier=Acme&weightMin=5&weightMax=20');

    await waitFor(() => {
      expect(lastCall()).toEqual(
        expect.objectContaining({ carrier: 'Acme', weightMin: '5', weightMax: '20' }),
      );
    });
  });

  it('distinguishes "no matches for these filters" from "no shipments at all"', async () => {
    const user = userEvent.setup();
    api.getAll.mockResolvedValue(page([], 0));
    renderPage();
    expect(await screen.findByText('No shipments available')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by status' }), 'CANCELLED');

    expect(await screen.findByText('No results found')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear Filters' }));
    await waitFor(() => expect(lastCall().status).toBeUndefined());
    expect(await screen.findByText('No shipments available')).toBeInTheDocument();
  });
});
