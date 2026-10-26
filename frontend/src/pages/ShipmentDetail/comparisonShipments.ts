import type { Shipment } from "@services/api/endpoints/shipments";
import { formatDate } from "@utils/localeFormat";
import type { MilestoneDetail } from "../../components/shipment/MilestoneTimeline/MilestoneTimeline";
import type { ShipmentForComparison } from "../../components/shipment/ShipmentComparison";

/** Maps a shipment's API milestones to the shape the timeline and comparison render. */
export function toMilestoneDetails(shipment: Shipment): MilestoneDetail[] {
  const milestones = shipment.milestones ?? [];
  return milestones.map((m, index) => {
    const isLast = index === milestones.length - 1;
    const isCurrent = shipment.status === "IN_TRANSIT" && isLast;
    const isDelivered = shipment.status === "DELIVERED";
    return {
      id: String(index + 1),
      name: m.name,
      timestamp: m.timestamp,
      location: m.description ?? "",
      status:
        isDelivered || (!isCurrent && index < milestones.length - 1)
          ? "completed"
          : isCurrent
          ? "current"
          : "upcoming",
      blockchainAddress: "",
    };
  });
}

function rawExpectedDelivery(shipment: Shipment): string | undefined {
  const meta = shipment.offChainMetadata;
  return (
    shipment.expectedDelivery ??
    shipment.estimatedDelivery ??
    (meta?.expectedDeliveryDate as string | undefined) ??
    (meta?.estimatedDelivery as string | undefined) ??
    (meta?.expectedDelivery as string | undefined)
  );
}

/** A real shipment from the list endpoint, in the shape ShipmentComparison renders. */
export function toComparisonShipment(shipment: Shipment): ShipmentForComparison {
  const id = shipment.id ?? shipment._id;
  const eta = rawExpectedDelivery(shipment);
  return {
    id,
    shipmentId: `#${shipment.trackingNumber || id}`,
    origin: shipment.origin,
    destination: shipment.destination,
    status: shipment.status,
    milestones: toMilestoneDetails(shipment),
    expectedDelivery: eta ? formatDate(eta) : "—",
    createdAt: shipment.createdAt ? formatDate(shipment.createdAt) : "—",
  };
}

/**
 * The shipments on offer in the comparison: the one on screen first, then the
 * other real shipments. Returns an empty list when there is nothing to compare
 * it with, so the caller can say so instead of opening a one-row comparison.
 */
export function buildComparisonShipments(
  current: ShipmentForComparison,
  others: Shipment[],
): ShipmentForComparison[] {
  const rest = others
    .filter((s) => (s.id ?? s._id) !== current.id)
    .map(toComparisonShipment);
  return rest.length > 0 ? [current, ...rest] : [];
}
