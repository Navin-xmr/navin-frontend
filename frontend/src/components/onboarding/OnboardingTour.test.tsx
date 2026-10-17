import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import OnboardingTour, {
  isTourComplete,
  markTourComplete,
  resetTourFlag,
  type TourStep,
} from "./OnboardingTour";

const sampleSteps: TourStep[] = [
  {
    targetId: "step-dashboard",
    heading: "Welcome to Dashboard",
    body: "Track all active shipments from here.",
    placement: "bottom",
  },
  {
    targetId: "step-wallet",
    heading: "Connect Wallet",
    body: "Link your Stellar wallet for escrow settlements.",
    placement: "right",
  },
];

describe("OnboardingTour (#744)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("manages tour completion state in localStorage via helper functions", () => {
    expect(isTourComplete()).toBe(false);
    markTourComplete();
    expect(isTourComplete()).toBe(true);
    resetTourFlag();
    expect(isTourComplete()).toBe(false);
  });

  it("does not render when steps array is empty or tour is already marked complete", () => {
    render(<OnboardingTour steps={[]} />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    markTourComplete();
    render(<OnboardingTour steps={sampleSteps} />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText("Welcome to Dashboard")).not.toBeInTheDocument();
  });

  it("renders the first step after initial delay, advances to next step, and completes on Done", () => {
    const onClose = vi.fn();
    render(
      <div>
        <div data-tour-id="step-dashboard">Dashboard Target</div>
        <div data-tour-id="step-wallet">Wallet Target</div>
        <OnboardingTour steps={sampleSteps} onClose={onClose} />
      </div>,
    );

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.getByText("Welcome to Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Track all active shipments from here.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    expect(screen.getByText("Link your Stellar wallet for escrow settlements.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /done/i }));

    expect(isTourComplete()).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByText("Connect Wallet")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation (ArrowRight/ArrowLeft) and Escape to skip", () => {
    const onClose = vi.fn();
    render(<OnboardingTour steps={sampleSteps} onClose={onClose} />);

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.getByText("Welcome to Dashboard")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("Welcome to Dashboard")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(isTourComplete()).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("allows skipping the tour via the Skip tour button", () => {
    const onClose = vi.fn();
    render(<OnboardingTour steps={sampleSteps} onClose={onClose} />);

    act(() => {
      vi.advanceTimersByTime(450);
    });

    fireEvent.click(screen.getByRole("button", { name: /skip tour/i }));
    expect(isTourComplete()).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
