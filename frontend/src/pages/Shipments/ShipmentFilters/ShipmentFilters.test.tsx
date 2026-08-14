import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ShipmentFilters from './ShipmentFilters';

describe('ShipmentFilters', () => {
  it('renders without crashing and initializes with empty filters', () => {
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: /filters/i }),
    ).toBeInTheDocument();

    expect(onFilterChange).toHaveBeenCalledWith({
      status: [],
      dateFrom: '',
      dateTo: '',
      carrier: '',
      origin: '',
      destination: '',
      weightMin: '',
      weightMax: '',
      priority: [],
    });
  });

  it('calls onFilterChange with the selected status', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));

    await user.click(screen.getByRole('checkbox', { name: 'Created' }));

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenLastCalledWith({
        status: ['CREATED'],
        dateFrom: '',
        dateTo: '',
        carrier: '',
        origin: '',
        destination: '',
        weightMin: '',
        weightMax: '',
        priority: [],
      });
    });
  });

  it('calls onFilterChange with the selected date range', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));

    await user.type(screen.getByLabelText('Date from'), '2026-08-01');
    await user.type(screen.getByLabelText('Date to'), '2026-08-14');

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenLastCalledWith({
        status: [],
        dateFrom: '2026-08-01',
        dateTo: '2026-08-14',
        carrier: '',
        origin: '',
        destination: '',
        weightMin: '',
        weightMax: '',
        priority: [],
      });
    });
  });

  it('clears all filters and calls onFilterChange with defaults', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));

    await user.click(screen.getByRole('checkbox', { name: 'Created' }));
    await user.type(screen.getByLabelText('Date from'), '2026-08-01');

    await user.click(
      screen.getByRole('button', { name: 'Clear All Filters' }),
    );

    expect(onFilterChange).toHaveBeenLastCalledWith({
      status: [],
      dateFrom: '',
      dateTo: '',
      carrier: '',
      origin: '',
      destination: '',
      weightMin: '',
      weightMax: '',
      priority: [],
    });

    expect(screen.getByLabelText('Date from')).toHaveValue('');
    expect(screen.getByLabelText('Date to')).toHaveValue('');
    expect(
      screen.getByRole('checkbox', { name: 'Created' }),
    ).toHaveAttribute('aria-checked', 'false');
  });
  it('provides accessible labels for all filter controls', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <MemoryRouter>
        <ShipmentFilters onFilterChange={onFilterChange} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByRole('checkbox', { name: 'Created' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'In Transit' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Delivered' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Cancelled' })).toBeInTheDocument();

    expect(screen.getByRole('checkbox', { name: 'Urgent' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Standard' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Economy' })).toBeInTheDocument();

    expect(screen.getByLabelText('Date from')).toBeInTheDocument();
    expect(screen.getByLabelText('Date to')).toBeInTheDocument();
    expect(screen.getByLabelText('Origin City')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination City')).toBeInTheDocument();
    expect(screen.getByLabelText('Carrier')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum weight')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum weight')).toBeInTheDocument();
  });
});

