import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ErrorFallback from './ErrorFallback';

describe('ErrorFallback', () => {
  it('renders the message of an Error instance', () => {
    render(<ErrorFallback error={new Error('Network failure')} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Network failure')).toBeInTheDocument();
  });

  it('stringifies non-Error values', () => {
    render(<ErrorFallback error="plain string error" />);

    expect(screen.getByText('plain string error')).toBeInTheDocument();
  });

  it('does not render the Try Again button without resetError', () => {
    render(<ErrorFallback error={new Error('Boom')} />);

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('calls resetError when Try Again is clicked', () => {
    const resetError = vi.fn();
    render(<ErrorFallback error={new Error('Boom')} resetError={resetError} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(resetError).toHaveBeenCalledTimes(1);
  });
});
