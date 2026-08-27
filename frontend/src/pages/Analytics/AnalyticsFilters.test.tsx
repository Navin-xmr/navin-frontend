import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AnalyticsFilters, { type AnalyticsFiltersValues } from './AnalyticsFilters';

const baseValues: AnalyticsFiltersValues = {
  startDate: '',
  endDate: '',
  regions: [],
  shipmentTypes: [],
};

describe('AnalyticsFilters', () => {
  it('renders the date inputs and filter toggle with no active filter badge', () => {
    render(<AnalyticsFilters values={baseValues} onChange={vi.fn()} regionOptions={['North', 'South']} />);

    expect(screen.getByLabelText('Start date')).toHaveValue('');
    expect(screen.getByLabelText('End date')).toHaveValue('');
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('Active filters')).not.toBeInTheDocument();
  });

  it('opens the filter panel and toggles a region on', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AnalyticsFilters values={baseValues} onChange={onChange} regionOptions={['North', 'South']} />);

    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByLabelText('North'));

    expect(onChange).toHaveBeenCalledWith({ ...baseValues, regions: ['North'] });
  });

  it('shows active filter chips and clears them via Clear All', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const activeValues: AnalyticsFiltersValues = {
      ...baseValues,
      regions: ['North'],
      shipmentTypes: ['URGENT'],
    };

    render(<AnalyticsFilters values={activeValues} onChange={onChange} regionOptions={['North', 'South']} />);

    expect(screen.getByText('Region: North')).toBeInTheDocument();
    expect(screen.getByText('Type: Urgent')).toBeInTheDocument();

    await user.click(screen.getByText('Clear All'));

    expect(onChange).toHaveBeenCalledWith({ ...activeValues, regions: [], shipmentTypes: [] });
  });

  it('shows an inline error when the start date is after the end date', () => {
    render(
      <AnalyticsFilters
        values={{ ...baseValues, startDate: '2026-02-10', endDate: '2026-02-01' }}
        onChange={vi.fn()}
        regionOptions={[]}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Start date must be before the end date.');
    expect(screen.getByLabelText('Start date')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a message when there are no region options for the selected period', async () => {
    const user = userEvent.setup();
    render(<AnalyticsFilters values={baseValues} onChange={vi.fn()} regionOptions={[]} />);

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByText('No regions available for the selected period.')).toBeInTheDocument();
  });
});
