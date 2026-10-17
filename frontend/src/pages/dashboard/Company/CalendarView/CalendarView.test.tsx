import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CalendarView } from "./CalendarView";
import { shipmentApi } from "../../../../services/api/endpoints/shipments";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../../services/api/endpoints/shipments", () => ({
  shipmentApi: {
    getAll: vi.fn(),
  },
}));

describe("CalendarView (#743)", () => {
  const today = new Date();
  const year = today.getFullYear();
  const monthStr = String(today.getMonth() + 1).padStart(2, "0");
  const targetDay = "15";
  const targetDateStr = `${year}-${monthStr}-${targetDay}`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders calendar grid, fetches shipments for the current month, and shows side panel on day click", async () => {
    vi.mocked(shipmentApi.getAll).mockResolvedValueOnce({
      data: [
        {
          id: "SHP-901",
          origin: "Lagos",
          destination: "Nairobi",
          status: "IN_TRANSIT",
          createdAt: `${year}-${monthStr}-01T00:00:00.000Z`,
          expectedDelivery: `${targetDateStr}T14:00:00.000Z`,
        },
      ],
    } as never);

    render(
      <MemoryRouter>
        <CalendarView />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(shipmentApi.getAll).toHaveBeenCalledOnce();
    });

    const dayButton = screen.getByRole("button", { name: "15" });
    fireEvent.click(dayButton);

    expect(screen.getByText("#SHP-901")).toBeInTheDocument();
    expect(screen.getByText("Lagos → Nairobi")).toBeInTheDocument();

    fireEvent.click(screen.getByText("#SHP-901"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/shipments/SHP-901");
  });

  it("navigates between months and shows empty state when a selected day has no shipments", async () => {
    vi.mocked(shipmentApi.getAll).mockResolvedValue({ data: [] } as never);

    render(
      <MemoryRouter>
        <CalendarView />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(shipmentApi.getAll).toHaveBeenCalledOnce();
    });

    fireEvent.click(screen.getByRole("button", { name: /next month/i }));
    await waitFor(() => {
      expect(shipmentApi.getAll).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole("button", { name: /previous month/i }));
    await waitFor(() => {
      expect(shipmentApi.getAll).toHaveBeenCalledTimes(3);
    });

    fireEvent.click(screen.getByRole("button", { name: /today/i }));
    expect(screen.getByText("No shipments expected.")).toBeInTheDocument();
  });

  it("handles API errors gracefully by clearing shipments and rendering empty day details", async () => {
    vi.mocked(shipmentApi.getAll).mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <CalendarView />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(shipmentApi.getAll).toHaveBeenCalledOnce();
    });

    fireEvent.click(screen.getByRole("button", { name: "10" }));
    expect(screen.getByText("No shipments expected.")).toBeInTheDocument();
  });
});
