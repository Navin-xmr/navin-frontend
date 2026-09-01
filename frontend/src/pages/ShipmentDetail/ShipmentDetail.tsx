import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useShipmentDetail } from "../../hooks/useShipmentDetail";
import { useTranslation } from "react-i18next";
import Breadcrumb from "@components/common/Breadcrumb";
import MilestoneTimeline, { MilestoneDetail } from "../../components/shipment/MilestoneTimeline/MilestoneTimeline";
import ShipmentDetailHeader from "./ShipmentDetailHeader/ShipmentDetailHeader";
import ShipmentMap from "./ShipmentMap/ShipmentMap";
import DeliveryProofUpload from "./DeliveryProofUpload/DeliveryProofUpload";
import PhotosSection from "./PhotosSection/PhotosSection";
import DocumentsSection from "../Shipment/sections/DocumentsSection/DocumentsSection";
import DeliveryConfirmation from "../../components/shipment/DeliveryConfirmation/DeliveryConfirmation";
import PaymentStatus, { PaymentData } from "./PaymentStatus/PaymentStatus";
import SensorDataCards, { SensorData } from "./SensorDataCards/SensorDataCards";
import EscrowStatus from "./EscrowStatus/EscrowStatus";
import { useRealtimeEvents } from "../../hooks/useRealtimeEvents";
import { useAuthContext } from "../../context/AuthContext";
import { can } from "../../utils/rbac";
import NotesSection from "../Shipment/sections/NotesSection/NotesSection";
import ShipmentSummaryPrint from "../../components/shipment/ShipmentSummaryPrint/ShipmentSummaryPrint";
import type { ShipmentSummaryPrintData } from "../../components/shipment/ShipmentSummaryPrint/ShipmentSummaryPrint";
import DisputeForm from "../Shipment/sections/DisputeForm/DisputeForm";
import type { DisputeData } from "../Shipment/sections/DisputeForm/DisputeForm";
import { useLiveRegion } from "../../context/LiveRegionContext";
import CostBreakdown from "../../components/shipment/CostBreakdown/CostBreakdown";
import type { CostBreakdownData } from "../../components/shipment/CostBreakdown/CostBreakdown";
import { useToast } from "../../context/ToastContext";
import { exportShipmentPdf } from "../../utils/exportShipmentPdf";
import ShipmentComparison from "../../components/shipment/ShipmentComparison/ShipmentComparison";
import type { ShipmentForComparison } from "../../components/shipment/ShipmentComparison/ShipmentComparison";
import ShipmentStickyBar from "./ShipmentStickyBar";
import { Zap } from "lucide-react";
import type { ShipmentStatus } from "../../types/realtimeEvents";

const ShipmentDetail: React.FC = () => {
  const { t } = useTranslation("shipments");
  const { id } = useParams<{ id: string }>();
  const { role } = useAuthContext();
  const isOnline = useOnlineStatus();
  const { announce } = useLiveRegion();
  const { addToast } = useToast();

  const { shipment, isLoading, error } = useShipmentDetail(id);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [existingDispute, setExistingDispute] = useState<DisputeData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ShipmentStatus | "CREATED">(shipment?.status ?? "IN_TRANSIT");

  // Ref attached to the hero heading — IntersectionObserver in ShipmentStickyBar
  // watches this element and shows the bar once it scrolls out of the viewport.
  const heroSentinelRef = useRef<HTMLDivElement>(null);

  const events = useRealtimeEvents(["shipment:status"]);
  const statusEvent = events["shipment:status"];
  React.useEffect(() => {
    if (statusEvent && statusEvent.shipmentId === id) {
      announce(`Shipment status updated to ${statusEvent.newStatus}`);
      Promise.resolve().then(() => {
        setCurrentStatus(statusEvent.newStatus);
        announce(t("shipmentDetail.statusUpdated", { status: statusEvent.newStatus }));
      });
    }
  }, [statusEvent, id, announce, t]);

  const shipmentHeaderData = {
    shipmentId: id ? `#${id}` : "#SHP-992834",
    trackingNumber: shipment?.trackingNumber ?? id ?? "SHP-992834", // TODO: swap for real public tracking token once backend exposes one
    status: shipment?.status ?? "IN_TRANSIT",
    originAddress: shipment?.origin ?? "New York Distribution Center, NY 10001",
    destinationAddress: shipment?.destination ?? "123 Main Street, Boston, MA 02101",
    expectedDeliveryDate: "Oct 24, 2026 by 5:00 PM EST",
    userRole: (role ?? "customer") as "company" | "customer",
    priority: shipment?.priority ?? "STANDARD",
  };

  const handleUpdateStatus = () => {
    console.log("Update status clicked");
  };
  const handleUpdatePriority = (priority: "URGENT" | "STANDARD" | "ECONOMY") => {
    console.log("Update priority clicked", priority);
  };
  const handleTrack = () => {
    console.log("Track clicked");
  };
  const handlePrint = () => {
    setIsPrinting(true);
  };
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportShipmentPdf(shipmentHeaderData.trackingNumber, contentRef);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to export PDF.", "error");
    } finally {
      setIsExporting(false);
    }
  };
  const handleRaiseDispute = () => {
    setIsDisputeOpen(true);
  };
  const handleDisputeSuccess = (dispute: DisputeData) => {
    setExistingDispute(dispute);
    setIsDisputeOpen(false);
    announce(t("shipmentDetail.disputeSubmitted", { ref: dispute.referenceNumber }));
  };

  // Derive payment data from real shipment stellar fields (null if not yet available)
  const paymentData: PaymentData | null = shipment?.stellarTxHash
    ? {
        amount: (shipment.offChainMetadata?.paymentAmount as string | undefined) ?? "—",
        tokenSymbol: (shipment.offChainMetadata?.tokenSymbol as string | undefined) ?? "XLM",
        status: (shipment.offChainMetadata?.paymentStatus as PaymentData["status"] | undefined) ?? "pending",
        payerAddress: (shipment.offChainMetadata?.payerAddress as string | undefined) ?? "",
        payeeAddress: (shipment.offChainMetadata?.payeeAddress as string | undefined) ?? "",
        transactionHash: shipment.stellarTxHash,
      }
    : null;

  // Sensor data: not stored on the Shipment object — passed as null until a telemetry API is wired
  const sensorData: SensorData | null = null;

  // Map real shipment milestones to MilestoneDetail shape
  const milestones: MilestoneDetail[] = shipment
    ? shipment.milestones.map((m, index) => {
        const isLast = index === shipment.milestones.length - 1;
        const isCurrent = shipment.status === "IN_TRANSIT" && isLast;
        const isDelivered = shipment.status === "DELIVERED";
        return {
          id: String(index + 1),
          name: m.name,
          timestamp: m.timestamp,
          location: m.description ?? "",
          status: isDelivered || (!isCurrent && index < shipment.milestones.length - 1)
            ? "completed"
            : isCurrent
            ? "current"
            : "upcoming",
          blockchainAddress: "",
        };
      })
    : [];

  // Cost breakdown: not stored on the Shipment object — passed as null until a billing API is wired
  const costBreakdown: CostBreakdownData | null = shipment?.offChainMetadata?.costBreakdown
    ? (shipment.offChainMetadata.costBreakdown as CostBreakdownData)
    : null;

  const summaryPrintData: ShipmentSummaryPrintData = {
    shipmentId: id ? `#${id}` : "#SHP-992834",
    trackingNumber: id ?? "SHP-992834",
    status: currentStatus,
    priority: shipmentHeaderData.priority,
    sender: { name: "Navin Logistics", address: shipmentHeaderData.originAddress },
    receiver: { name: "Customer", address: shipmentHeaderData.destinationAddress },
    createdAt: "2026-06-20",
    expectedDelivery: shipmentHeaderData.expectedDeliveryDate,
    milestones: milestones.map((m) => ({
      name: m.name,
      timestamp: m.timestamp,
      location: m.location,
      status: m.status,
      blockchainAddress: m.blockchainAddress,
    })),
    costItems: costBreakdown
      ? [
          { label: "Base Rate", amount: costBreakdown.baseRate },
          { label: "Weight Surcharge", amount: costBreakdown.weightSurcharge },
          { label: "Fuel Surcharge", amount: costBreakdown.fuelSurcharge },
          { label: "Insurance Fee", amount: costBreakdown.insuranceFee },
          { label: "Customs Duty", amount: costBreakdown.customsDuty ?? 0 },
          { label: "Discount", amount: costBreakdown.discount ?? 0, isDiscount: true },
        ]
      : [],
    totalCost: { amount: costBreakdown?.total ?? 0, currency: costBreakdown?.currency ?? "USD" },
    payment: paymentData
      ? {
          amount: paymentData!.amount,
          tokenSymbol: paymentData!.tokenSymbol,
          status: paymentData!.status,
          transactionHash: paymentData!.transactionHash,
        }
      : undefined,
    sensorSnapshot: sensorData
      ? {
          temperature: sensorData!.temperature
            ? { value: sensorData!.temperature!.value, unit: sensorData!.temperature!.unit }
            : undefined,
          humidity: sensorData!.humidity
            ? { value: sensorData!.humidity!.value, unit: sensorData!.humidity!.unit }
            : undefined,
          location: sensorData!.gps
            ? { latitude: sensorData!.gps!.latitude, longitude: sensorData!.gps!.longitude }
            : undefined,
        }
      : undefined,
    stellarTxHash: paymentData?.transactionHash,
  };

  if (isLoading && !shipment) {
    return (
      <div className="relative min-h-screen w-full bg-[radial-gradient(ellipse_at_50%_0%,#0a3d3a_0%,#061e20_35%,#020d10_70%,#000_100%)] flex flex-col items-center justify-center gap-4 font-sans">
        <Loader2 className="animate-spin text-[#00d4c8]" size={32} />
        <p className="text-[rgba(200,230,240,0.75)] text-sm">Loading shipment details...</p>
      </div>
    );
  }

  if (error && !shipment) {
    return (
      <div className="relative min-h-screen w-full bg-[radial-gradient(ellipse_at_50%_0%,#0a3d3a_0%,#061e20_35%,#020d10_70%,#000_100%)] flex flex-col items-center justify-center gap-4 font-sans px-4 text-center">
        <AlertTriangle className="text-[#ef4444]" size={40} />
        <p className="text-white font-semibold">Failed to load shipment</p>
        <p className="text-[rgba(200,230,240,0.75)] text-sm">{error}</p>
      </div>
    );
  }

  // Mock comparison shipments for #508
  const comparisonShipments: ShipmentForComparison[] = [
    {
      id: "1",
      shipmentId: "#SHP-992834",
      origin: shipmentHeaderData.originAddress,
      destination: shipmentHeaderData.destinationAddress,
      status: currentStatus,
      milestones: milestones,
      expectedDelivery: shipmentHeaderData.expectedDeliveryDate,
      createdAt: shipment?.createdAt ?? "2026-06-20",
    },
    {
      id: "2",
      shipmentId: "#SHP-992835",
      origin: "Los Angeles, CA 90001",
      destination: "San Francisco, CA 94101",
      status: "IN_TRANSIT",
      milestones: milestones.slice(0, 3),
      expectedDelivery: "Oct 25, 2026 by 3:00 PM PST",
      createdAt: "2026-06-21",
    },
    {
      id: "3",
      shipmentId: "#SHP-992836",
      origin: "Chicago, IL 60601",
      destination: "Miami, FL 33101",
      status: "DELIVERED",
      milestones: milestones,
      expectedDelivery: "Oct 20, 2026 by 2:00 PM EST",
      createdAt: "2026-06-19",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(ellipse_at_50%_0%,#0a3d3a_0%,#061e20_35%,#020d10_70%,#000_100%)] px-8 py-16 md:px-4 md:py-8 sm:px-3 sm:py-6 font-sans">
      {/* Sticky summary bar — appears when the hero section scrolls out of view */}
      <ShipmentStickyBar
        sentinelRef={heroSentinelRef}
        shipmentId={shipmentHeaderData.shipmentId}
        status={currentStatus}
        originAddress={shipmentHeaderData.originAddress}
        destinationAddress={shipmentHeaderData.destinationAddress}
        expectedDeliveryDate={shipmentHeaderData.expectedDeliveryDate}
        priority={shipmentHeaderData.priority}
      />

      <div ref={contentRef} className="max-w-300 mx-auto relative z-10">
        <Breadcrumb
          items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shipments", href: "/dashboard/shipments" }]}
          current={id ? `#${id}` : "#SHP-992834"}
        />

        {/* Hero heading — sentinel for sticky bar */}
        <div ref={heroSentinelRef} className="text-center mb-16 md:mb-10">
          <h1 className="font-['Bebas_Neue',sans-serif] text-[clamp(2.5rem,7vw,5rem)] font-normal tracking-[0.04em] leading-[1.1] text-white m-0 mb-4">
            {t("shipmentDetail.titlePart1")} <span className="text-[#00d4c8]">{t("shipmentDetail.titlePart2")}</span>
          </h1>
          <p className="text-[clamp(0.95rem,2vw,1.1rem)] font-light leading-[1.7] text-[rgba(200,230,240,0.75)] max-w-150 mx-auto">
            {t("shipmentDetail.subtitle")}
          </p>
          {(role === 'company') && (
            <button
              onClick={() => setIsComparisonOpen(true)}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium text-sm transition-colors"
            >
              <Zap className="w-4 h-4" />
              Compare Shipments
            </button>
          )}
        </div>

        <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl p-8 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] md:p-5 md:rounded-2xl sm:p-4">
          <ShipmentMap
            shipmentId={id}
            origin={shipmentHeaderData.originAddress}
            destination={shipmentHeaderData.destinationAddress}
            originCoords={{ lat: 40.7128, lng: -74.006 }}
            destinationCoords={{ lat: 42.3601, lng: -71.0589 }}
            initialLocation={
              sensorData?.gps
                ? {
                    lat: sensorData.gps.latitude,
                    lng: sensorData.gps.longitude,
                    timestamp: sensorData.gps.lastUpdated,
                  }
                : undefined
            }
          />
          <ShipmentDetailHeader
            {...shipmentHeaderData}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePriority={handleUpdatePriority}
            onTrack={handleTrack}
            onPrint={handlePrint}
            onRaiseDispute={handleRaiseDispute}
            onExport={handleExport}
            isExporting={isExporting}
          />
          {isDisputeOpen && (
            <div className="mt-8">
              <DisputeForm
                shipmentId={id ?? shipmentHeaderData.shipmentId}
                existingDispute={existingDispute}
                onClose={() => setIsDisputeOpen(false)}
                onSuccess={handleDisputeSuccess}
              />
            </div>
          )}

          {existingDispute && !isDisputeOpen && (
            <div className="mt-8">
              <DisputeForm shipmentId={id ?? shipmentHeaderData.shipmentId} existingDispute={existingDispute} onClose={() => setExistingDispute(null)} />
            </div>
          )}

          <div className="h-px bg-[rgba(0,212,200,0.2)] my-8" />
          <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white mt-10 mb-0 text-center md:mb-8">
            {t("shipmentDetail.milestoneTitlePart1")} <span className="text-[#00d4c8]">{t("shipmentDetail.milestoneTitlePart2")}</span>
          </h2>
          <MilestoneTimeline milestones={milestones} />
        </div>

        <SensorDataCards sensorData={sensorData} />
        <PaymentStatus payment={paymentData} />
        <CostBreakdown data={costBreakdown} mode="confirmed" />
        <EscrowStatus shipmentId={id ?? shipmentHeaderData.shipmentId} />

        {can(role, "shipment:upload-proof") && <DeliveryProofUpload shipmentId={id || shipmentHeaderData.shipmentId} />}

        <PhotosSection shipmentId={id || shipmentHeaderData.shipmentId} canDelete={can(role, "shipment:upload-proof")} />

        <DocumentsSection shipmentId={id || shipmentHeaderData.shipmentId} userRole={shipmentHeaderData.userRole} />

        {can(role, "shipment:confirm-milestone") && (
          <DeliveryConfirmation
            shipmentId={shipmentHeaderData.shipmentId}
            status={shipmentHeaderData.status}
            onConfirm={async (confirmId, rating, feedback) => {
              console.log("Delivery confirmed", { confirmId, rating, feedback });
            }}
          />
        )}

        {!isOnline && <div className="p-4 rounded-xl border border-border text-text-secondary text-sm text-center">{t("shipmentDetail.offlineBanner")}</div>}

        <NotesSection shipmentId={id ?? shipmentHeaderData.shipmentId} userRole={shipmentHeaderData.userRole} />

        {isPrinting && <ShipmentSummaryPrint data={summaryPrintData} onClose={() => setIsPrinting(false)} />}
      </div>

      {/* Shipment Comparison Modal (#508) */}
      <ShipmentComparison
        shipments={comparisonShipments}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </div>
  );
};

export default ShipmentDetail;
