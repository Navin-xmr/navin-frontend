import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WidgetRefreshIndicator from './WidgetRefreshIndicator';

const NOW = new Date('2026-01-01T12:00:00Z');

const secondsAgo = (s: number) => new Date(NOW.getTime() - s * 1000);

describe('WidgetRefreshIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an enabled refresh button in the idle state', () => {
    const onRefresh = vi.fn();
    render(<WidgetRefreshIndicator status="idle" lastRefreshedAt={null} onRefresh={onRefresh} />);

    const button = screen.getByRole('button', { name: 'Refresh widget data' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-disabled', 'false');

    fireEvent.click(button);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables the button and shows a spinner while refreshing', () => {
    const onRefresh = vi.fn();
    render(<WidgetRefreshIndicator status="refreshing" lastRefreshedAt={null} onRefresh={onRefresh} />);

    const button = screen.getByRole('button', { name: 'Refreshing…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button.querySelector('svg')).toHaveClass('animate-spin');

    fireEvent.click(button);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('shows an error message in the error state', () => {
    render(<WidgetRefreshIndicator status="error" lastRefreshedAt={null} onRefresh={vi.fn()} />);

    expect(screen.getByText('Failed to refresh')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh widget data' })).toBeEnabled();
  });

  it('does not show an error message outside the error state', () => {
    render(<WidgetRefreshIndicator status="success" lastRefreshedAt={null} onRefresh={vi.fn()} />);
    expect(screen.queryByText('Failed to refresh')).not.toBeInTheDocument();
  });

  it('omits the timestamp when there is no last-refreshed date', () => {
    const { container } = render(
      <WidgetRefreshIndicator status="idle" lastRefreshedAt={null} onRefresh={vi.fn()} />,
    );
    expect(container.querySelector('.tabular-nums')).not.toBeInTheDocument();
  });

  it.each([
    [5, 'just now'],
    [30, '30s ago'],
    [5 * 60, '5m ago'],
  ])('formats a last-updated time %i seconds ago as "%s"', (seconds, expected) => {
    render(
      <WidgetRefreshIndicator status="success" lastRefreshedAt={secondsAgo(seconds)} onRefresh={vi.fn()} />,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('falls back to a clock time for updates over an hour old', () => {
    const date = secondsAgo(2 * 60 * 60);
    render(<WidgetRefreshIndicator status="idle" lastRefreshedAt={date} onRefresh={vi.fn()} />);

    const expected = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('hides the timestamp when hideTimestamp is set', () => {
    render(
      <WidgetRefreshIndicator
        status="idle"
        lastRefreshedAt={secondsAgo(30)}
        onRefresh={vi.fn()}
        hideTimestamp
      />,
    );
    expect(screen.queryByText('30s ago')).not.toBeInTheDocument();
  });
});
