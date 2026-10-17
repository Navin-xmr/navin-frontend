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
