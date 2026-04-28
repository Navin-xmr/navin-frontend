import React from "react";
import { Package, ArrowRight } from "lucide-react";

export type ShipmentStatus =
  | "pending"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

export type UserRole = "company" | "customer";

export interface ShipmentDetailHeaderProps {
  shipmentId: string;
  status: ShipmentStatus;
  expectedDeliveryDate: string;
  userRole: UserRole;
  originAddress?: string;
  destinationAddress?: string;
  onUpdateStatus?: () => void;
  onTrack?: () => void;
}

const ShipmentDetailHeader: React.FC<ShipmentDetailHeaderProps> = ({
  shipmentId,
  status,
  expectedDeliveryDate,
  userRole,
  originAddress,
  destinationAddress,
  onUpdateStatus,
  onTrack,
}) => {
  const statusColors: Record<ShipmentStatus, string> = {
    pending: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
    in_transit: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
    out_for_delivery:
      "bg-purple-500/20 text-purple-300 border border-purple-500/40",
    delivered: "bg-green-500/20 text-green-300 border border-green-500/40",
  };

  const formatStatus = (status: ShipmentStatus): string =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div className="bg-background-card p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Icon Container */}
        <div className="bg-emerald-300/20 flex items-center justify-center rounded-xl w-20 h-20 shrink-0">
          <Package className="w-10 h-10 text-[#00d4c8]" />
        </div>

        {/* Shipment Info */}
        <div className="flex flex-col gap-2">
          {/* Title + Status */}
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {shipmentId}
            </h1>

            <span
              className={`inline-flex items-center px-4 gap-1.5 py-2 w-24 h-6 text-center justify-center rounded-full text-sm font-semibold whitespace-nowrap shrink-0 ${statusColors[status]}`}
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              {formatStatus(status)}
            </span>
          </div>

          <p className="text-sm md:text-base text-text-primary text-white/80">
            ETA: {expectedDeliveryDate}
          </p>

          {/* Origin to Destination */}
          {originAddress && destinationAddress && (
            <div className="flex items-center text-white/70 gap-2 mt-2 flex-wrap">
              <span className="text-xs md:text-sm text-text-secondary">
                {originAddress}
              </span>
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs md:text-sm text-text-secondary">
                {destinationAddress}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex gap-3 w-full text-lg md:w-auto">
        {userRole === "company" && (
          <button
            onClick={onUpdateStatus}
            className="px-6 py-3 rounded-lg bg-emerald-400/50 hover:bg-emerald-500 text-white font-semibold transition-colors duration-200 w-40 h-12"
          >
            Update Status
          </button>
        )}

        {userRole === "customer" && (
          <button
            onClick={onTrack}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors duration-200 w-10 md:w-auto"
          >
            Track
          </button>
        )}
      </div>
    </div>
  );
};

export default ShipmentDetailHeader;
