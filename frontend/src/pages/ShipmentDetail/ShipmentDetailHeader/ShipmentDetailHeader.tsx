import React, { useState } from "react";
import { Package, ArrowRight, QrCode, Printer, AlertTriangle } from "lucide-react";
import { getStatusDisplayLabel, getStatusBadgeClass, getStatusDotClass } from '../../../utils/shipmentStatus';
import ShareQRCodeModal from "../ShareQRCodeModal/ShareQRCodeModal";
import PriorityBadge from "../../../../components/ui/PriorityBadge";

export type UserRole = "company" | "customer";

export interface ShipmentDetailHeaderProps {
  shipmentId: string;
  trackingNumber: string;
  status: string; // backend enum
  expectedDeliveryDate: string;
  userRole: UserRole;
  originAddress?: string;
  destinationAddress?: string;
  priority?: 'URGENT' | 'STANDARD' | 'ECONOMY';
  onUpdateStatus?: () => void;
  onUpdatePriority?: (priority: 'URGENT' | 'STANDARD' | 'ECONOMY') => void;
  onTrack?: () => void;
  onPrint?: () => void;
  onRaiseDispute?: () => void;
}

const ShipmentDetailHeader: React.FC<ShipmentDetailHeaderProps> = ({
  shipmentId,
  trackingNumber,
  status,
  expectedDeliveryDate,
  userRole,
  originAddress,
  destinationAddress,
  priority,
  onUpdateStatus,
  onUpdatePriority,
  onTrack,
  onPrint,
  onRaiseDispute,
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const formatStatus = (status: string): string => getStatusDisplayLabel(status);
  const isCompanyUser = userRole === "company";

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
          {/* Title + Status + Priority */}
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {shipmentId}
            </h1>

            <span
              className={`inline-flex items-center px-4 gap-1.5 py-2 w-24 h-6 text-center justify-center rounded-full text-sm font-semibold whitespace-nowrap shrink-0 ${getStatusBadgeClass(status)}`}
            >
              <span className={`w-2 h-2 ${getStatusDotClass(status)} rounded-full animate-pulse`}></span>
              {formatStatus(status)}
            </span>

            {isCompanyUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                  className="flex items-center gap-1"
                  aria-label="Change priority"
                >
                  <PriorityBadge priority={priority} />
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                {showPriorityMenu && (
                  <div className="absolute z-10 mt-1 w-32 bg-[#1a1f2e] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-lg py-1">
                    {(['URGENT', 'STANDARD', 'ECONOMY'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          onUpdatePriority?.(p);
                          setShowPriorityMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[rgba(255,255,255,0.05)] ${priority === p ? 'text-white font-medium' : 'text-gray-300'}`}
                      >
                        {p === 'URGENT' ? 'Urgent' : p === 'STANDARD' ? 'Standard' : 'Economy'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <PriorityBadge priority={priority} />
            )}
          </div>

          {(() => {
            const shipmentStatus = status as ShipmentStatus;
            return <ETACountdown expectedDelivery={expectedDeliveryDate} status={shipmentStatus} />;
          })()}


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
            aria-label="Track shipment"
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors duration-200 w-10 md:w-auto"
          >
            Track
          </button>
        )}

        {status === "DELIVERED" && onRaiseDispute && (
          <button
            onClick={onRaiseDispute}
            aria-label="Raise dispute"
            className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors duration-200 flex items-center gap-2 justify-center"
          >
            <AlertTriangle className="w-5 h-5" />
            Raise Dispute
          </button>
        )}

        <button
          onClick={() => setIsQrModalOpen(true)}
          aria-label="Share QR Code"
          className="px-6 py-3 rounded-lg bg-background-elevated border border-border hover:bg-background-card text-white font-semibold transition-colors duration-200 flex items-center gap-2 justify-center"
        >
          <QrCode className="w-5 h-5" />
          Share QR Code
        </button>
        <button
          onClick={onPrint}
          aria-label="Print shipment receipt"
          className="px-6 py-3 rounded-lg bg-background-elevated border border-border hover:bg-background-card text-white font-semibold transition-colors duration-200 flex items-center gap-2 justify-center"
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </button>
      </div>

      <ShareQRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        trackingNumber={trackingNumber}
      />
    </div>
  );
};

export default ShipmentDetailHeader;