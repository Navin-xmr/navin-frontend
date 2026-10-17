import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecentActivityFeed from "./RecentActivityFeed";
import { activityApi } from "../../../../api/activityApi";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts?.id ? `${key}:${String(opts.id)}` : key,
  }),
}));

vi.mock("../../../../api/activityApi", () => ({
  activityApi: {
    getActivity: vi.fn(),
  },
}));

describe("RecentActivityFeed (#743)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renders populated activity items grouped by date with shipment links", async () => {
    const nowIso = new Date().toISOString();
    vi.mocked(activityApi.getActivity).mockResolvedValueOnce({
      data: [
        {
          id: "act-1",
          type: "SHIPMENT_DELIVERED",
          description: "Shipment delivered at port",
          shipmentId: "SHP-500",
          createdAt: nowIso,
        },
        {
          id: "act-2",
          type: "PAYMENT_SETTLED",
          description: "Escrow released on Stellar",
          createdAt: nowIso,
        },
      ],
    });

    render(
      <MemoryRouter>
        <RecentActivityFeed />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Shipment delivered at port")).toBeInTheDocument();
    });

    expect(screen.getByText("Escrow released on Stellar")).toBeInTheDocument();
    expect(screen.getByText("recentActivity.groupToday")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "recentActivity.shipmentLink:SHP-500" })).toHaveAttribute(
      "href",
      "/shipments/SHP-500",
    );
    expect(screen.getByText("recentActivity.caughtUp")).toBeInTheDocument();
  });

  it("renders empty state when no activity items are returned", async () => {
    vi.mocked(activityApi.getActivity).mockResolvedValueOnce({
      data: [],
    });

    render(
      <MemoryRouter>
        <RecentActivityFeed />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("recentActivity.emptyTitle")).toBeInTheDocument();
    });
    expect(screen.getByText("recentActivity.emptyBody")).toBeInTheDocument();
  });

  it("renders error state on API failure and retries when the retry button is clicked", async () => {
    vi.mocked(activityApi.getActivity)
      .mockRejectedValueOnce(new Error("Server unavailable"))
      .mockResolvedValueOnce({
        data: [
          {
            id: "act-recovered",
            type: "ANOMALY_ALERT",
            description: "Temperature threshold warning",
            createdAt: new Date().toISOString(),
          },
        ],
      });

    render(
      <MemoryRouter>
        <RecentActivityFeed />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("recentActivity.errorTitle")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "recentActivity.retry" }));

    await waitFor(() => {
      expect(screen.getByText("Temperature threshold warning")).toBeInTheDocument();
    });
    expect(activityApi.getActivity).toHaveBeenCalledTimes(2);
  });
});
