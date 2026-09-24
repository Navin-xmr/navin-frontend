import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ShipmentFilters, { type ShipmentFiltersValues } from './ShipmentFilters';
import ShipmentsEmptyState from '../components/ShipmentsEmptyState';

const emptyFilters: ShipmentFiltersValues = {
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

describe('ShipmentFilters', () => {
  it('renders without crashing', () => {
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    const toggleButton = screen.getByRole('button', { name: /filters/i });
    expect(toggleButton).toBeInTheDocument();
    expect(onFilterChange).toHaveBeenCalledWith(emptyFilters);
  });

  it('handles status filter change and notifies callback', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    // Open filter sheet
    await user.click(screen.getByRole('button', { name: /filters/i }));

    // Click 'Delivered' chip
    const deliveredChip = screen.getByRole('button', { name: /delivered/i });
    await user.click(deliveredChip);

    await waitFor(
      () => {
        expect(onFilterChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            status: ['DELIVERED'],
          }),
        );
      },
      { timeout: 1500 },
    );
  });

  it('updates date range filter inputs and calls callback with correct values', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));

    const dateFromInput = screen.getByLabelText('Date from');
    const dateToInput = screen.getByLabelText('Date to');

    fireEvent.change(dateFromInput, { target: { value: '2026-03-01' } });
    fireEvent.change(dateToInput, { target: { value: '2026-03-15' } });

    await waitFor(
      () => {
        expect(onFilterChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            dateFrom: '2026-03-01',
            dateTo: '2026-03-15',
          }),
        );
      },
      { timeout: 1500 },
    );
  });

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter initialEntries={['/?status=DELIVERED&carrier=DHL']}>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    // Because filters were preloaded from URL, active chip bar should display 'Clear All'
    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    expect(clearAllButton).toBeInTheDocument();

    await user.click(clearAllButton);

    expect(onFilterChange).toHaveBeenLastCalledWith(emptyFilters);
  });

  it('provides accessible labels for each filter field', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));

    // Groups with aria-labelledby
    expect(screen.getByRole('group', { name: /^status$/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /^priority$/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /^date range$/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /^weight range \(kg\)$/i })).toBeInTheDocument();

    // Inputs with labels
    expect(screen.getByLabelText('Date from')).toBeInTheDocument();
    expect(screen.getByLabelText('Date to')).toBeInTheDocument();
    expect(screen.getByLabelText('Origin City')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination City')).toBeInTheDocument();
    expect(screen.getByLabelText('Carrier')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum weight (kg)')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum weight (kg)')).toBeInTheDocument();
  });

  it('displays empty state message when filters produce no matching results', () => {
    const onClearFilters = vi.fn();

    render(
      <ShipmentsEmptyState
        error={null}
        isEmpty={false}
        isFilterEmpty={true}
        onClearFilters={onClearFilters}
      />,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('No shipments match the selected filters.')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
