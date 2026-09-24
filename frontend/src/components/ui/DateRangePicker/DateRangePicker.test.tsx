import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders closed with a placeholder when no range is selected', () => {
    render(<DateRangePicker value={{ from: null, to: null }} onChange={vi.fn()} />);

    expect(screen.getByText('Select date range')).toBeInTheDocument();
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('displays the formatted range once both dates are set', () => {
    render(
      <DateRangePicker
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 0, 5) }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Jan 1, 2026 - Jan 5, 2026')).toBeInTheDocument();
  });

  it('opens the calendar popover when the trigger is clicked', () => {
    render(<DateRangePicker value={{ from: null, to: null }} onChange={vi.fn()} />);

    fireEvent.click(screen.getByText('Select date range'));

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('applies the "Last 7 days" preset and closes the popover', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 15));

    const onChange = vi.fn();
    render(<DateRangePicker value={{ from: null, to: null }} onChange={onChange} />);

    fireEvent.click(screen.getByText('Select date range'));
    fireEvent.click(screen.getByText('Last 7 days'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [{ from, to }] = onChange.mock.calls[0];
    expect(from.getDate()).toBe(9);
    expect(to.getDate()).toBe(15);
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('clears the range via the clear button without opening the calendar', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker value={{ from: new Date(2026, 0, 15), to: null }} onChange={onChange} />,
    );

    const trigger = screen.getByText('Jan 15, 2026').closest('button') as HTMLButtonElement;
    const clearButton = within(trigger).getByRole('button');
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith({ from: null, to: null });
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });
});
