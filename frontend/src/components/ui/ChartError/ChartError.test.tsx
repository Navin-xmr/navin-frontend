import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChartError from './ChartError';

describe('ChartError', () => {
  it('renders the default error message', () => {
    render(<ChartError />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load chart data.')).toBeInTheDocument();
  });

  it('renders a custom error message', () => {
    render(<ChartError message="Unable to fetch revenue." />);

    expect(screen.getByText('Unable to fetch revenue.')).toBeInTheDocument();
  });

  it('does not render the Retry button without onRetry', () => {
    render(<ChartError />);

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn();
    render(<ChartError onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
