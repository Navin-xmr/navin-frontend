import React, { useState } from "react";
import { Package, ArrowRight, QrCode, Printer, AlertTriangle, ChevronDown, Download, Loader2 } from "lucide-react";
import { getStatusDisplayLabel, getStatusBadgeClass, getStatusDotClass } from '../../../utils/shipmentStatus';
import ShareQRCodeModal from "../ShareQRCodeModal/ShareQRCodeModal";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import CopyToClipboard from "../../../components/ui/CopyToClipboard";
import ETACountdown from "../../../components/shipment/ETACountdown";
import InlineEditField from "../../../components/ui/InlineEditField";
import RoleAccessInfo from "../../../components/ui/RoleAccessInfo";
import AccessRestrictedBadge from "../../../components/ui/AccessRestrictedBadge";
import type { ShipmentStatus } from "../../../services/api/endpoints/shipments";

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
  onExport?: () => void;
  isExporting?: boolean;
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
  onExport,
  isExporting = false,
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [editOrigin, setEditOrigin] = useState(originAddress || '');
  const [editDestination, setEditDestination] = useState(destinationAddress || '');

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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {shipmentId}
              </h1>
              <CopyToClipboard value={shipmentId} label="Copy ID" size="sm" className="border-border/50 text-text-secondary hover:text-text-primary" />
            </div>

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

          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-text-secondary">
            <span className="font-medium uppercase tracking-[0.2em] text-text-secondary/70">Tracking</span>
            <span className="font-mono text-white">{trackingNumber}</span>
            <CopyToClipboard value={trackingNumber} label="Copy tracking" size="sm" className="border-border/50 text-text-secondary hover:text-text-primary" />
          </div>

          {/* Origin to Destination - with inline editing for company users */}
          {originAddress && destinationAddress && (
            <div className="mt-3 space-y-2">
              {isCompanyUser ? (
                <div className="space-y-2">
                  <InlineEditField
                    value={editOrigin}
                    onSave={async (newValue) => {
                      setEditOrigin(newValue);
                      console.log('Origin updated to:', newValue);
                    }}
                    label="Origin Address"
                    isEditable={true}
                    validation={(val) => (!val.trim() ? 'Origin address cannot be empty' : null)}
                  />
                  <div className="flex items-center gap-2 py-2">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-text-secondary/50">Route</span>
                  </div>
                  <InlineEditField
                    value={editDestination}
                    onSave={async (newValue) => {
                      setEditDestination(newValue);
                      console.log('Destination updated to:', newValue);
                    }}
                    label="Destination Address"
                    isEditable={true}
                    validation={(val) => (!val.trim() ? 'Destination address cannot be empty' : null)}
                  />
                </div>
              ) : (
                <div className="flex items-center text-white/70 gap-2 flex-wrap">
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
          )}
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex gap-3 w-full flex-col md:flex-row md:w-auto">
        {userRole === "company" && (
          <button
            onClick={onUpdateStatus}
            className="px-6 py-3 rounded-lg bg-emerald-400/50 hover:bg-emerald-500 text-white font-semibold transition-colors duration-200 w-full md:w-40 h-12"
          >
            Update Status
          </button>
        )}

        {userRole === "customer" && (
          <>
            <button
              onClick={onTrack}
              aria-label="Track shipment"
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors duration-200 flex-1 md:flex-none"
            >
              Track
            </button>
            <RoleAccessInfo
              hasAccess={false}
              action="Status updates"
              requiredRole="Company Account"
              userRole="Customer"
              className="md:hidden text-xs"
            />
          </>
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
        <button
          onClick={onExport}
          disabled={isExporting}
          aria-label="Export shipment as PDF"
          className="px-6 py-3 rounded-lg bg-background-elevated border border-border hover:bg-background-card text-white font-semibold transition-colors duration-200 flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isExporting ? "Exporting..." : "Export PDF"}
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