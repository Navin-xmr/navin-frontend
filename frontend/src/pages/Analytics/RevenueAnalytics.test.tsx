import { render, screen } from "@testing-library/react";
import RevenueAnalytics from "./RevenueAnalytics";
import { describe, it, expect } from "vitest";

describe("RevenueAnalytics", () => {
  it("renders the Revenue Analytics page", () => {
    render(<RevenueAnalytics />);
    expect(screen.getByText("Revenue Analytics")).toBeInTheDocument();
  });

  it("displays KPI cards", async () => {
    render(<RevenueAnalytics />);
    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Month-over-Month Change")).toBeInTheDocument();
    expect(screen.getByText("Avg Revenue per Shipment")).toBeInTheDocument();
  });

  it("displays chart titles", async () => {
    render(<RevenueAnalytics />);
    expect(await screen.findByText("Monthly Revenue")).toBeInTheDocument();
    expect(screen.getByText("Revenue by Service Type")).toBeInTheDocument();
    expect(screen.getByText("Revenue by Region")).toBeInTheDocument();
    expect(screen.getByText("Top 10 Customers")).toBeInTheDocument();
  });

  it("displays date input fields", () => {
    render(<RevenueAnalytics />);
    const dateInputs = screen.getAllByDisplayValue(/2026|2025/);
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  it("displays export button", () => {
    render(<RevenueAnalytics />);
    const exportButton = screen.getByRole("button", { name: /export pdf/i });
    expect(exportButton).toBeInTheDocument();
  });
});
