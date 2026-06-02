import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToastProvider, useToast } from "../../../context/ToastContext";
import { BrowserRouter } from "react-router-dom";

// Helper component to trigger toasts during testing
const TestComponent = () => {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast("Test Message", "success", "/test-path")}>
      Show Toast
    </button>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>{ui}</ToastProvider>
    </BrowserRouter>,
  );
};

describe("Toast System", () => {
  it("should show a toast when addToast is called", () => {
    renderWithProviders(<TestComponent />);

    fireEvent.click(screen.getByText("Show Toast"));

    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("should auto-dismiss after 5 seconds", () => {
    vi.useFakeTimers();
    renderWithProviders(<TestComponent />);

    fireEvent.click(screen.getByText("Show Toast"));
    expect(screen.getByText("Test Message")).toBeInTheDocument();

    // Fast-forward 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("Test Message")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("should dismiss immediately when close button is clicked", () => {
    renderWithProviders(<TestComponent />);

    fireEvent.click(screen.getByText("Show Toast"));
    const closeButton = screen.getByRole("button", { name: "" }); // The X icon button

    fireEvent.click(closeButton);

    expect(screen.queryByText("Test Message")).not.toBeInTheDocument();
  });

  it("should stack up to 3 toasts and remove the oldest", () => {
    const StackTrigger = () => {
      const { addToast } = useToast();
      return (
        <button
          onClick={() => {
            addToast("Toast 1", "info");
            addToast("Toast 2", "info");
            addToast("Toast 3", "info");
            addToast("Toast 4", "info");
          }}
        >
          Trigger 4
        </button>
      );
    };

    renderWithProviders(<StackTrigger />);
    fireEvent.click(screen.getByText("Trigger 4"));

    // "Toast 1" should be gone because we only keep the last 3
    expect(screen.queryByText("Toast 1")).not.toBeInTheDocument();
    expect(screen.getByText("Toast 2")).toBeInTheDocument();
    expect(screen.getByText("Toast 3")).toBeInTheDocument();
    expect(screen.getByText("Toast 4")).toBeInTheDocument();
  });
});
