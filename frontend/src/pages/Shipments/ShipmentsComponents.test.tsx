import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Shipment, ShipmentsResponse } from '../../api/shipmentApi';
import ShipmentsKanban from './KanbanView/ShipmentsKanban';
import ShipmentsFilterToolbar from './components/ShipmentsFilterToolbar';
import ShipmentsExportButton from './components/ShipmentsExportButton';
import ShipmentsEmptyState from './components/ShipmentsEmptyState';
import ShipmentsViewToggle from './components/ShipmentsViewToggle';

const shipmentApiMock = vi.hoisted(() => ({ getAll: vi.fn() }));
vi.mock('../../api/shipmentApi', () => ({ shipmentApi: shipmentApiMock }));

function makeShipment(id: string, status: Shipment['status'] = 'CREATED'): Shipment {
  return {
    id,
    origin: 'Lagos',
    destination: 'Abuja',
    status,
    priority: 'STANDARD',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

describe('shipment presentation components', () => {
  it('emits search and select changes from the filter toolbar', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onStatusChange = vi.fn();
    const onPriorityChange = vi.fn();
    const onTimeframeChange = vi.fn();
    render(
      <MemoryRouter>
        <ShipmentsFilterToolbar
          searchQuery=""
          onSearchChange={onSearchChange}
          statusFilter="ALL"
          onStatusChange={onStatusChange}
          priorityFilter="ALL"
          onPriorityChange={onPriorityChange}
          timeframeFilter="ALL"
          onTimeframeChange={onTimeframeChange}
        />
      </MemoryRouter>,
    );
    await user.type(screen.getByPlaceholderText('Search by ID, origin, or destination...'), 'SHP-1');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by status' }), 'DELIVERED');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by priority' }), 'URGENT');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by timeframe' }), '30');
    await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith('SHP-1'));
    expect(onStatusChange).toHaveBeenCalledWith('DELIVERED');
    expect(onPriorityChange).toHaveBeenCalledWith('URGENT');
    expect(onTimeframeChange).toHaveBeenCalledWith('30');
  });

  it('handles export state, view changes, and clearing an empty filter result', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    const onViewChange = vi.fn();
    const onClearFilters = vi.fn();
    const { rerender } = render(
      <>
        <ShipmentsExportButton isExporting={false} disabled={false} onExport={onExport} />
        <ShipmentsViewToggle view="list" onViewChange={onViewChange} />
        <ShipmentsEmptyState
          error={null}
          isEmpty={false}
          isFilterEmpty
          onClearFilters={onClearFilters}
        />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Export shipments to CSV' }));
    await user.click(screen.getByRole('button', { name: 'Kanban' }));
    await user.click(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(onExport).toHaveBeenCalledOnce();
    expect(onViewChange).toHaveBeenCalledWith('kanban');
    expect(onClearFilters).toHaveBeenCalledOnce();
    rerender(<ShipmentsExportButton isExporting disabled onExport={onExport} />);
    expect(screen.getByRole('button', { name: 'Export shipments to CSV' })).toBeDisabled();
    expect(screen.getByText('Exporting')).toBeInTheDocument();
  });

  it('loads shipments into status columns and navigates when a card is opened', async () => {
    const response: ShipmentsResponse = {
      data: [makeShipment('SHP-1', 'CREATED'), makeShipment('SHP-2', 'DELIVERED')],
      meta: { page: 1, limit: 100, total: 2 },
    };
    shipmentApiMock.getAll.mockResolvedValue(response);
    render(
      <MemoryRouter initialEntries={['/dashboard/shipments']}>
        <ShipmentsKanban />
        <LocationProbe />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText('SHP-1')).toBeInTheDocument());
    expect(screen.getByRole('region', { name: 'Created column' })).toHaveTextContent('1');
    expect(screen.getByRole('region', { name: 'Delivered column' })).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('button', { name: 'Open shipment SHP-2' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard/shipments/SHP-2');
  });

  it('shows the Kanban loading, error, and empty column states', async () => {
    shipmentApiMock.getAll.mockRejectedValueOnce(new Error('API unavailable'));
    const { unmount } = render(
      <MemoryRouter>
        <ShipmentsKanban />
      </MemoryRouter>,
    );
    expect(screen.getByText('Loading board…')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Error: API unavailable')).toBeInTheDocument());
    unmount();
    shipmentApiMock.getAll.mockResolvedValueOnce({ data: [], meta: { page: 1, limit: 100, total: 0 } });
    render(
      <MemoryRouter>
        <ShipmentsKanban />
      </MemoryRouter>,
    );
    expect(await screen.findAllByText('No shipments')).toHaveLength(4);
  });

  beforeEach(() => {
    shipmentApiMock.getAll.mockClear();
  });
});
