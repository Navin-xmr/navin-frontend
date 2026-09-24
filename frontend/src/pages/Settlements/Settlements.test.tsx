import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Settlements from "./Settlements";
import type {
  PaginatedSettlements,
  Settlement,
  SettlementDetail,
} from "@services/api/endpoints/settlements";
import type { AuthContextValue } from "../../context/AuthContext";
import { LiveRegionProvider } from "../../context/LiveRegionContext";

const api = vi.hoisted(() => ({
  getSettlements: vi.fn(),
  getSettlementById: vi.fn(),
}));

vi.mock("@services/api/endpoints/settlements", () => ({
  settlementsApi: api,
}));

const mockAuthContextValue = vi.fn<() => AuthContextValue>();

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: () => mockAuthContextValue(),
}));

vi.mock("../../hooks/useRealtimeEvents", () => ({
  useRealtimeEvents: () => ({}),
}));

function authValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    isLoading: false,
    isAuthenticated: true,
    role: "company",
    userId: "user-1",
    logout: vi.fn(),
    ...overrides,
  };
}

const settlements: Settlement[] = [
  {
    _id: "settlement-1",
    createdAt: "2026-08-20T12:00:00.000Z",
    shipmentId: "SHP-001",
    amount: 1500,
    token: "USDC",
    status: "ESCROWED",
    stellarTxHash: "abc1234567890defgh",
  },
  {
    _id: "settlement-2",
    createdAt: "2026-08-19T12:00:00.000Z",
    shipmentId: "SHP-002",
    amount: 1200,
    token: "USDC",
    status: "RELEASED",
  },
  {
    _id: "settlement-3",
    createdAt: "2026-08-18T12:00:00.000Z",
    shipmentId: "SHP-003",
    amount: 300,
    token: "XLM",
    status: "PENDING",
  },
];

const detail: SettlementDetail = {
  settlement: {
    ...settlements[0],
    payerAddress: "GPAYER123",
    payeeAddress: "GPAYEE456",
    escrowRelease: {
      conditionDescription: "Delivery verified by recipient",
      releasedAt: "2026-08-21",
      disputedAt: undefined,
      disputeReason: undefined,
    },
  },
};

function response(
  data: Settlement[] = settlements,
  total = data.length,
): PaginatedSettlements {
  return { data, page: 1, limit: 10, total };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <LiveRegionProvider>
        <Settlements />
      </LiveRegionProvider>
    </MemoryRouter>,
  );
}

describe("Settlements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContextValue.mockReturnValue(authValue());
    api.getSettlements.mockResolvedValue(response());
    api.getSettlementById.mockResolvedValue(detail);
  });

  it("loads settlements and renders summary totals and status badges", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Settlements" }),
    ).toBeInTheDocument();

    expect((await screen.findAllByText("SHP-001")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("ESCROWED").length).toBeGreaterThan(0);
    expect(screen.getAllByText("RELEASED").length).toBeGreaterThan(0);
    expect(screen.getAllByText("PENDING").length).toBeGreaterThan(0);

    // Total settled aggregates only RELEASED rows (1,200 from settlement-2).
    expect(
      screen.getByText("Total settled").nextElementSibling,
    ).toHaveTextContent("1,200");
    // Pending count reflects the single PENDING row.
    expect(screen.getByText("Pending").nextElementSibling).toHaveTextContent(
      "1",
    );
    expect(api.getSettlements).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    // A company-role user can release the one escrowed settlement (desktop
    // row only — the mobile card labels the same action "Release Payment")
    // and dispute any non-disputed row across both the desktop and mobile
    // layouts (3 rows x 2 layouts).
    expect(screen.getAllByRole("button", { name: "Release" })).toHaveLength(
      1,
    );
    expect(screen.getAllByRole("button", { name: "Dispute" })).toHaveLength(
      6,
    );
  });

  it("shows a retryable error and reloads successfully after retry", async () => {
    api.getSettlements
      .mockRejectedValueOnce(new Error("settlements unavailable"))
      .mockResolvedValueOnce(response());
    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByText("Failed to load settlements"),
    ).toBeInTheDocument();
    expect(screen.getByText("settlements unavailable")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect((await screen.findAllByText("SHP-001")).length).toBeGreaterThan(0);
    expect(api.getSettlements).toHaveBeenCalledTimes(2);
  });

  it("shows the empty state when no settlements match the criteria", async () => {
    api.getSettlements.mockResolvedValue(response([], 0));
    renderPage();

    expect(
      await screen.findByText("No Settlements Found"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Settlements will appear here once escrow contracts/i),
    ).toBeInTheDocument();
  });

  it("requests the selected status and toggles the date sort order", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("SHP-001");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Filter by settlement status" }),
      "ESCROWED",
    );
    await waitFor(() =>
      expect(api.getSettlements).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        status: "ESCROWED",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    );

    await user.click(
      screen.getByRole("button", { name: "Sort by date newest first" }),
    );
    await waitFor(() =>
      expect(api.getSettlements).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        status: "ESCROWED",
        sortBy: "createdAt",
        sortOrder: "asc",
      }),
    );
    expect(
      screen.getByRole("button", { name: "Sort by date oldest first" }),
    ).toBeInTheDocument();
  });

  it("opens the escrow detail modal on row click and closes it", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("SHP-001");

    await user.click(screen.getAllByText("1,500")[0]);

    expect(
      await screen.findByRole("dialog", { name: "Escrow Details" }),
    ).toBeInTheDocument();
    expect(api.getSettlementById).toHaveBeenCalledWith("settlement-1");
    expect(
      await screen.findByText("Delivery verified by recipient"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /Verify on Blockchain/i }),
    ).toHaveAttribute(
      "href",
      "https://stellar.expert/explorer/public/tx/abc1234567890defgh",
    );

    const closeButtons = screen.getAllByRole("button", { name: "Close" });
    await user.click(closeButtons[0]);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("hides release and dispute actions for a role without settlement permissions", async () => {
    mockAuthContextValue.mockReturnValue(authValue({ role: "customer" }));
    renderPage();

    await screen.findAllByText("SHP-001");

    expect(
      screen.queryByRole("button", { name: "Release" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Dispute" }),
    ).not.toBeInTheDocument();
  });
});
