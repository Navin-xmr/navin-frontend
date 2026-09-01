import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RevenueAnalytics from "./RevenueAnalytics";
import { describe, it, expect } from "vitest";

describe("RevenueAnalytics", () => {
  it("renders the Revenue Analytics page", () => {
    render(
      <MemoryRouter>
        <RevenueAnalytics />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Revenue Analytics", level: 1 }),
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

  it("displays export button", () => {
    render(
      <MemoryRouter>
        <RevenueAnalytics />
      </MemoryRouter>,
    );
    const exportButton = screen.getByRole("button", { name: /export pdf/i });
    expect(exportButton).toBeInTheDocument();
  });
});
