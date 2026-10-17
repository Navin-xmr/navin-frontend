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
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorFallbackDefault, { ErrorFallback, type ErrorFallbackProps } from "./index";

describe("ErrorFallback barrel and component (#1121)", () => {
  it("re-exports default and named ErrorFallback from the index.ts barrel", () => {
    expect(ErrorFallbackDefault).toBe(ErrorFallback);
  });

  it("renders error message and invokes resetError when Try Again is clicked", () => {
    const resetError = vi.fn();
    const props: ErrorFallbackProps = {
      error: new Error("Telemetry stream disconnected"),
      resetError,
    };

    render(<ErrorFallback {...props} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Telemetry stream disconnected")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(resetError).toHaveBeenCalledOnce();
  });
});
