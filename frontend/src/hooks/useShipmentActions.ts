import { useCallback } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { shipmentApi, type ShipmentStatus } from "@services/api/endpoints/shipments";
import { exportShipmentPdf } from "@utils/exportShipmentPdf";
import type { useShipmentDetail } from "@hooks/useShipmentDetail";
import type { DisputeData } from "@pages/ShipmentDetail/DisputeForm/DisputeForm";

export type ShipmentHeaderPriority = "URGENT" | "STANDARD" | "ECONOMY";

export interface PendingDeliveryConfirmation {
  rating: number;
  feedback: string;
}

export interface UseShipmentActionsParams {
  id: string | undefined;
  role: string | null | undefined;
  shipment: ReturnType<typeof useShipmentDetail>["shipment"];
  shipmentHeaderData: { trackingNumber: string; shipmentId: string };
  contentRef: React.RefObject<HTMLDivElement | null>;
  refresh: () => void;
  setIsPrinting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDisputeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setExistingDispute: React.Dispatch<React.SetStateAction<DisputeData | null>>;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsComparisonOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUpdatingPriority: React.Dispatch<React.SetStateAction<boolean>>;
  setPriorityOverride: React.Dispatch<React.SetStateAction<ShipmentHeaderPriority | null>>;
  setIsDeliveryConfirmDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConfirmingDelivery: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingDeliveryConfirmation: React.Dispatch<React.SetStateAction<PendingDeliveryConfirmation | null>>;
  deliveryConfirmationResolver: React.MutableRefObject<{ resolve: () => void; reject: (error: Error) => void } | null>;
  pendingDeliveryConfirmation: PendingDeliveryConfirmation | null;
  setStatusOverride: React.Dispatch<React.SetStateAction<ShipmentStatus | null>>;
  setIsStatusModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUpdatingStatus: React.Dispatch<React.SetStateAction<boolean>>;
  currentStatus: ShipmentStatus;
  announce: (message: string) => void;
  addToast: (message: string, type: "success" | "error") => void;
  t: (key: string, fallback?: string | Record<string, unknown>) => string;
  navigate: ReturnType<typeof useNavigate>;
}

export interface UseShipmentActionsReturn {
  handleUpdateStatus: () => void;
  handleApplyStatusUpdate: (nextStatus: ShipmentStatus) => Promise<void>;
  handleUpdatePriority: (priority: ShipmentHeaderPriority) => Promise<void>;
  handleTrack: () => void;
  handleDeliveryConfirmation: (shipmentId: string, rating: number, feedback: string) => Promise<void>;
  handleConfirmDelivery: () => Promise<void>;
  handleCancelDeliveryConfirmation: () => void;
  handlePrint: () => void;
  handleExport: () => Promise<void>;
  handleRaiseDispute: () => void;
  handleDisputeSuccess: (dispute: DisputeData) => void;
}

export function useShipmentActions(params: UseShipmentActionsParams): UseShipmentActionsReturn {
  const {
    id,
    shipment,
    shipmentHeaderData,
    contentRef,
    refresh,
    setIsPrinting,
    setIsDisputeOpen,
    setExistingDispute,
    setIsExporting,
    setIsUpdatingPriority,
    setPriorityOverride,
    setIsDeliveryConfirmDialogOpen,
    setIsConfirmingDelivery,
    setPendingDeliveryConfirmation,
    deliveryConfirmationResolver,
    pendingDeliveryConfirmation,
    setStatusOverride,
    setIsStatusModalOpen,
    setIsUpdatingStatus,
    announce,
    addToast,
    t,
    navigate,
  } = params;

  const handleUpdateStatus = useCallback(() => {
    setIsStatusModalOpen(true);
  }, [setIsStatusModalOpen]);

  const handleApplyStatusUpdate = useCallback(
    async (nextStatus: ShipmentStatus) => {
      if (!id) return;
      setIsUpdatingStatus(true);
      try {
        const updated = await shipmentApi.updateStatus(id, nextStatus);
        const resultingStatus = updated?.status ?? nextStatus;
        setStatusOverride(resultingStatus);
        refresh();
        addToast(
          t("shipmentDetail.statusUpdateSuccess", `Shipment status updated to ${resultingStatus}.`),
          "success",
        );
        announce(`Shipment status updated to ${resultingStatus}`);
        setIsStatusModalOpen(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update shipment status.";
        addToast(message, "error");
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [id, setIsUpdatingStatus, setStatusOverride, refresh, addToast, t, announce, setIsStatusModalOpen],
  );

  const handleUpdatePriority = useCallback(
    async (priority: ShipmentHeaderPriority) => {
      if (!id) return;
      setIsUpdatingPriority(true);
      let lastError: Error | null = null;
      try {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            const updated = await shipmentApi.updatePriority(id, priority);
            setPriorityOverride(updated?.priority ?? priority);
            refresh();
            addToast(`Shipment priority updated to ${updated?.priority ?? priority}.`, "success");
            return;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error("Failed to update shipment priority.");
            if (attempt < 2) {
              await new Promise<void>((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
            }
          }
        }
        addToast(lastError?.message ?? "Failed to update shipment priority.", "error");
        throw lastError ?? new Error("Failed to update shipment priority.");
      } finally {
        setIsUpdatingPriority(false);
      }
    },
    [id, setIsUpdatingPriority, setPriorityOverride, refresh, addToast],
  );

  const handleTrack = useCallback(() => {
    const trackingNumber = shipmentHeaderData.trackingNumber;
    if (!trackingNumber) return;
    navigate(`/track/${encodeURIComponent(trackingNumber)}`, {
      state: { shipmentId: id, shipment },
    });
  }, [shipmentHeaderData.trackingNumber, navigate, id, shipment]);

  const handleDeliveryConfirmation = useCallback(
    (_shipmentId: string, rating: number, feedback: string) =>
      new Promise<void>((resolve, reject) => {
        deliveryConfirmationResolver.current = { resolve, reject };
        setPendingDeliveryConfirmation({ rating, feedback });
        setIsDeliveryConfirmDialogOpen(true);
      }),
    [deliveryConfirmationResolver, setPendingDeliveryConfirmation, setIsDeliveryConfirmDialogOpen],
  );

  const handleConfirmDelivery = useCallback(async () => {
    if (!id || !pendingDeliveryConfirmation || !deliveryConfirmationResolver.current) return;

    const resolver = deliveryConfirmationResolver.current;
    const timestamp = new Date().toISOString();
    const notes = pendingDeliveryConfirmation.feedback.trim();
    setIsConfirmingDelivery(true);

    try {
      const request = notes ? { timestamp, notes } : { timestamp };
      const response = await shipmentApi.confirmDelivery(id, request);
      const proof = response.deliveryProof ?? response.proof;
      const proofDetails = proof
        ? [
            proof.id ? `Proof ID: ${proof.id}` : null,
            proof.confirmedBy ? `Confirmed by: ${proof.confirmedBy}` : null,
            proof.confirmedAt ?? proof.timestamp
              ? `Recorded at: ${proof.confirmedAt ?? proof.timestamp}`
              : null,
          ].filter((detail): detail is string => Boolean(detail))
        : [];
      addToast(
        `Delivery confirmed. Delivery proof: ${proofDetails.length > 0 ? proofDetails.join("; ") : `Recorded at: ${timestamp}`}.`,
        "success",
      );
      refresh();
      resolver.resolve();
      setIsDeliveryConfirmDialogOpen(false);
      setPendingDeliveryConfirmation(null);
      deliveryConfirmationResolver.current = null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to confirm delivery.");
      addToast(error.message, "error");
      resolver.reject(error);
      setIsDeliveryConfirmDialogOpen(false);
      setPendingDeliveryConfirmation(null);
      deliveryConfirmationResolver.current = null;
    } finally {
      setIsConfirmingDelivery(false);
    }
  }, [
    id,
    pendingDeliveryConfirmation,
    deliveryConfirmationResolver,
    setIsConfirmingDelivery,
    addToast,
    refresh,
    setIsDeliveryConfirmDialogOpen,
    setPendingDeliveryConfirmation,
  ]);

  const handleCancelDeliveryConfirmation = useCallback(() => {
    const resolver = deliveryConfirmationResolver.current;
    if (resolver) resolver.reject(new Error("Delivery confirmation cancelled."));
    deliveryConfirmationResolver.current = null;
    setIsDeliveryConfirmDialogOpen(false);
    setPendingDeliveryConfirmation(null);
  }, [deliveryConfirmationResolver, setIsDeliveryConfirmDialogOpen, setPendingDeliveryConfirmation]);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
  }, [setIsPrinting]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportShipmentPdf(shipmentHeaderData.trackingNumber, contentRef);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to export PDF.", "error");
    } finally {
      setIsExporting(false);
    }
  }, [setIsExporting, shipmentHeaderData.trackingNumber, contentRef, addToast]);

  const handleRaiseDispute = useCallback(() => {
    setIsDisputeOpen(true);
  }, [setIsDisputeOpen]);

  const handleDisputeSuccess = useCallback(
    (dispute: DisputeData) => {
      setExistingDispute(dispute);
      setIsDisputeOpen(false);
      announce(t("shipmentDetail.disputeSubmitted", { ref: dispute.referenceNumber }));
    },
    [setExistingDispute, setIsDisputeOpen, announce, t],
  );

  return {
    handleUpdateStatus,
    handleApplyStatusUpdate,
    handleUpdatePriority,
    handleTrack,
    handleDeliveryConfirmation,
    handleConfirmDelivery,
    handleCancelDeliveryConfirmation,
    handlePrint,
    handleExport,
    handleRaiseDispute,
    handleDisputeSuccess,
  };
}
