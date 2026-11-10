import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useShipmentActions, type PendingDeliveryConfirmation } from "./useShipmentActions";
import { shipmentApi } from "@services/api/endpoints/shipments";

vi.mock("@services/api/endpoints/shipments", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@services/api/endpoints/shipments")>();
  return {
    ...actual,
    shipmentApi: {
      ...actual.shipmentApi,
      confirmDelivery: vi.fn(),
      updateStatus: vi.fn(),
      updatePriority: vi.fn(),
    },
  };
});

describe("useShipmentActions delivery confirmation flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens dialog on handleDeliveryConfirmation and resolves promise on handleConfirmDelivery", async () => {
    let pending: PendingDeliveryConfirmation | null = { rating: 5, feedback: "Arrived intact" };
    const resolverRef = {
      current: null as { resolve: () => void; reject: (error: Error) => void } | null,
    };
    const setPendingDeliveryConfirmation = vi.fn((val) => {
      pending = typeof val === "function" ? val(pending) : val;
    });
    const setIsDeliveryConfirmDialogOpen = vi.fn();
    const setIsConfirmingDelivery = vi.fn();
    const refresh = vi.fn();
    const addToast = vi.fn();

    vi.mocked(shipmentApi.confirmDelivery).mockResolvedValueOnce({
      message: "Confirmed",
      deliveryProof: { id: "proof-1", confirmedBy: "receiver", confirmedAt: "2026-11-10T00:00:00Z" },
    } as never);

    const { result } = renderHook(() =>
      useShipmentActions({
        id: "ship-001",
        role: "company",
        shipment: null,
        shipmentHeaderData: { trackingNumber: "TRK-001", shipmentId: "#ship-001" },
        contentRef: { current: null },
        refresh,
        setIsPrinting: vi.fn(),
        setIsDisputeOpen: vi.fn(),
        setExistingDispute: vi.fn(),
        setIsExporting: vi.fn(),
        setIsComparisonOpen: vi.fn(),
        setIsUpdatingPriority: vi.fn(),
        setPriorityOverride: vi.fn(),
        setIsDeliveryConfirmDialogOpen,
        setIsConfirmingDelivery,
        setPendingDeliveryConfirmation,
        deliveryConfirmationResolverRef: resolverRef,
        pendingDeliveryConfirmation: pending,
        setStatusOverride: vi.fn(),
        setIsStatusModalOpen: vi.fn(),
        setIsUpdatingStatus: vi.fn(),
        currentStatus: "IN_TRANSIT",
        announce: vi.fn(),
        addToast,
        t: (k) => k,
        navigate: vi.fn(),
      }),
    );

    let confirmationPromise: Promise<void> | undefined;
    act(() => {
      confirmationPromise = result.current.handleDeliveryConfirmation("ship-001", 5, "Arrived intact");
    });

    expect(setIsDeliveryConfirmDialogOpen).toHaveBeenCalledWith(true);
    expect(resolverRef.current).not.toBeNull();

    await act(async () => {
      await result.current.handleConfirmDelivery();
    });

    await expect(confirmationPromise).resolves.toBeUndefined();
    expect(shipmentApi.confirmDelivery).toHaveBeenCalledWith("ship-001", {
      timestamp: expect.any(String),
      notes: "Arrived intact",
    });
    expect(resolverRef.current).toBeNull();
    expect(refresh).toHaveBeenCalled();
  });
});
