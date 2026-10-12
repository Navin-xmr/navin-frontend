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
  getSummary: vi.fn(),
}));

vi.mock("@services/api/endpoints/settlements", () => ({
  settlementsApi: api,
}));

const mockAuthContextValue = vi.fn<() => AuthContextValue>();

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: () => mockAuthContextValue(),
}));

const realtime = vi.hoisted(() => ({ events: vi.fn() }));

vi.mock("../../hooks/useRealtimeEvents", () => ({
  useRealtimeEvents: () => realtime.events(),
}));

function authValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    isLoading: false,
    isAuthenticated: true,
    role: "company",
    userId: "user-1",
    refresh: vi.fn(),
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
    realtime.events.mockReturnValue({});
    api.getSettlements.mockResolvedValue(response());
    api.getSettlementById.mockResolvedValue(detail);
    api.getSummary.mockResolvedValue({
      totalReleased: 1200,
      totalInEscrow: 500,
      totalPending: 1,
      sparkline: [],
    });
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

    // Total settled and pending come from the backend summary endpoint, not the current page.
    expect(
      screen.getByText("Total settled").nextElementSibling,
    ).toHaveTextContent("1,200");
    expect(screen.getByText("Pending").nextElementSibling).toHaveTextContent(
      "1",
    );
    expect(api.getSettlements).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 10,
        status: undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

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
      expect(api.getSettlements).toHaveBeenLastCalledWith(
        {
          page: 1,
          limit: 10,
          status: "ESCROWED",
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );

    await user.click(
      screen.getByRole("button", { name: "Sort by date newest first" }),
    );
    await waitFor(() =>
      expect(api.getSettlements).toHaveBeenLastCalledWith(
        {
          page: 1,
          limit: 10,
          status: "ESCROWED",
          sortBy: "createdAt",
          sortOrder: "asc",
        },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
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
      "https://stellar.expert/explorer/testnet/tx/abc1234567890defgh",
    );

    const closeButtons = screen.getAllByRole("button", { name: "Close" });
    await user.click(closeButtons[0]);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("keeps summary totals stable across pages and reflects all settlements", async () => {
    // 25 settlements exist in total, but each page only carries a few rows.
    // The summary must come from the aggregate endpoint, not from those rows.
    const pageTwo: Settlement[] = [
      {
        _id: "settlement-11",
        createdAt: "2026-08-10T12:00:00.000Z",
        shipmentId: "SHP-011",
        amount: 50,
        token: "USDC",
        status: "PENDING",
      },
    ];
    api.getSettlements.mockImplementation(async ({ page }: { page: number }) =>
      page === 2
        ? { data: pageTwo, page: 2, limit: 10, total: 25 }
        : { data: settlements, page: 1, limit: 10, total: 25 },
    );
    api.getSummary.mockResolvedValue({
      totalReleased: 98765,
      totalInEscrow: 43210,
      totalPending: 5555,
      sparkline: [],
    });
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("SHP-001");

    const settled = () => screen.getByText("Total settled").nextElementSibling;
    const escrow = () => screen.getByText("In escrow").nextElementSibling;
    const pending = () => screen.getByText("Pending").nextElementSibling;

    // Totals exceed anything the 3 visible rows could add up to (3,000).
    await waitFor(() => expect(settled()).toHaveTextContent("98,765"));
    expect(escrow()).toHaveTextContent("43,210");
    expect(pending()).toHaveTextContent("5,555");
    expect(
      screen.getByText("Total records").nextElementSibling,
    ).toHaveTextContent("25");

    await user.click(screen.getByRole("button", { name: "2" }));
    expect((await screen.findAllByText("SHP-011")).length).toBeGreaterThan(0);
    expect(api.getSettlements).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
      expect.anything(),
    );

    // Same numbers on page 2, and the summary was not refetched per page.
    expect(settled()).toHaveTextContent("98,765");
    expect(escrow()).toHaveTextContent("43,210");
    expect(pending()).toHaveTextContent("5,555");
    expect(api.getSummary).toHaveBeenCalledTimes(1);
  });

  it("refreshes the summary totals when a settlement status changes in realtime", async () => {
    const { rerender } = renderPage();
    await screen.findAllByText("SHP-001");
    await waitFor(() =>
      expect(screen.getByText("Total settled").nextElementSibling).toHaveTextContent("1,200"),
    );
    expect(api.getSummary).toHaveBeenCalledTimes(1);

    api.getSummary.mockResolvedValue({
      totalReleased: 2700,
      totalInEscrow: 0,
      totalPending: 1,
      sparkline: [],
    });
    realtime.events.mockReturnValue({
      "settlement:status": {
        type: "settlement:status",
        settlementId: "settlement-1",
        newStatus: "RELEASED",
      },
    });
    rerender(
      <MemoryRouter>
        <LiveRegionProvider>
          <Settlements />
        </LiveRegionProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(api.getSummary).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByText("Total settled").nextElementSibling).toHaveTextContent("2,700"),
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
