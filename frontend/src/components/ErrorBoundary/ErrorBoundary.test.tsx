import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundaryDefault, { ErrorBoundary, type ErrorBoundaryProps } from "./index";

const ProblemChild: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Simulated render crash");
  }
  return <div>Safe content</div>;
};

describe("ErrorBoundary barrel and component (#1127)", () => {
  it("re-exports default and named ErrorBoundary from the index.ts barrel", () => {
    expect(ErrorBoundaryDefault).toBe(ErrorBoundary);
  });

  it("renders children when no error occurs", () => {
    const props: ErrorBoundaryProps = {
      children: <ProblemChild shouldThrow={false} />,
    };
    render(<ErrorBoundary {...props} />);
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("catches errors, renders default fallback UI, and resets when Try Again is clicked", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let shouldThrow = true;

    const DynamicChild: React.FC = () => {
      if (shouldThrow) {
        throw new Error("Render explosion");
      }
      return <div>Recovered view</div>;
    };

    render(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(screen.getByText("Recovered view")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
