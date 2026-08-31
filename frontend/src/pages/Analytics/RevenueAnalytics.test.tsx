import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RevenueAnalytics from "./RevenueAnalytics";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { getPerformanceMock, getAllMock } = vi.hoisted(() => ({
  getPerformanceMock: vi.fn(),
  getAllMock: vi.fn(),
}));

vi.mock("../../services/api/endpoints/analytics", () => ({
  analyticsApi: {
    getPerformance: getPerformanceMock,
  },
}));

vi.mock("../../services/api/endpoints/shipments", () => ({
  shipmentApi: {
    getAll: getAllMock,
  },
}));

describe("RevenueAnalytics", () => {
  beforeEach(() => {
    getPerformanceMock.mockReset();
    getAllMock.mockReset();
    getPerformanceMock.mockResolvedValue({
      startDate: "2026-07-29",
      endDate: "2026-08-29",
      shipmentsByStatus: [{ status: "DELIVERED", total: 12 }],
      averageDeliveryTimeByLogisticsId: [],
      totalDelayedShipments: 0,
    });
    getAllMock.mockResolvedValue({
      data: [
        {
          _id: "s1",
          id: "s1",
          trackingNumber: "SHP-1",
          origin: "Lagos, Nigeria",
          destination: "Accra, Ghana",
          enterpriseId: "e1",
          logisticsId: "l1",
          status: "DELIVERED",
          priority: "STANDARD",
          milestones: [],
          createdAt: "2026-08-01T00:00:00Z",
          updatedAt: "2026-08-10T00:00:00Z",
        },
        {
          _id: "s2",
          id: "s2",
          trackingNumber: "SHP-2",
          origin: "Nairobi, Kenya",
          destination: "Kampala, Uganda",
          enterpriseId: "e1",
          logisticsId: "l1",
          status: "DELIVERED",
          priority: "EXPRESS",
          milestones: [],
          createdAt: "2026-07-01T00:00:00Z",
          updatedAt: "2026-07-15T00:00:00Z",
        },
      ],
      meta: { nextCursor: null, hasMore: false },
    });
  });

  it("renders the Revenue Analytics page", async () => {
    render(
      <MemoryRouter>
        <RevenueAnalytics />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "Revenue Analytics", level: 1 }),
    ).toBeInTheDocument();
  });

  it("displays KPI cards", async () => {
    render(
      <MemoryRouter>
        <RevenueAnalytics />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Month-over-Month Change")).toBeInTheDocument();
    expect(screen.getByText("Avg Revenue per Shipment")).toBeInTheDocument();
  });

  it("displays chart titles", async () => {
    render(
      <MemoryRouter>
        <RevenueAnalytics />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Monthly Revenue")).toBeInTheDocument();
    expect(screen.getByText("Revenue by Service Type")).toBeInTheDocument();
    expect(screen.getByText("Revenue by Region")).toBeInTheDocument();
    expect(screen.getByText("Top 10 Customers")).toBeInTheDocument();
  });

  it("displays date input fields", () => {
    render(
      <MemoryRouter>
        <RevenueAnalytics />
      </MemoryRouter>,
    );
    const dateInputs = screen.getAllByDisplayValue(/2026|2025/);
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  it("displays export button", async () => {
    render(
      <MemoryRouter>
        <RevenueAnalytics />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("button", { name: /export pdf/i })).toBeInTheDocument();
  });
});