import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

let shouldThrow = true;

function Thrower() {
  if (shouldThrow) {
    throw new Error('Boom');
  }
  return <div>Child content</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error is thrown', () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('catches a thrown child error and renders the default fallback', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error: Boom')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      '[ErrorBoundary] Caught an error:',
      expect.any(Error),
      expect.anything()
    );
  });

  it('renders a custom fallback node', () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Thrower />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('passes the error and reset function to a fallback render function', () => {
    const fallback = vi.fn((error: Error | null, resetError: () => void) => (
      <button onClick={resetError}>{error?.message}</button>
    ));

    render(
      <ErrorBoundary fallback={fallback}>
        <Thrower />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: 'Boom' })).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Boom' }));

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('re-renders children when Try Again is clicked', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
