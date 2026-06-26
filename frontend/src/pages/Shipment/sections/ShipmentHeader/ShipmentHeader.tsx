import { safeFormatDate } from '../../../../utils/safeFormat';
import React, { useState } from 'react';
import { Download, Share2, MapPin, Printer, ChevronDown } from 'lucide-react';
import { StatusBadge } from '../../../../components/ui/StatusBadge/StatusBadge';
import PriorityBadge from '../../../../components/ui/PriorityBadge';
import type { ShipmentStatus } from '../../../../services/api/endpoints/shipments';
import ShipmentPrintView from '../PrintView/ShipmentPrintView';
import './ShipmentHeader.css';

export interface ShipmentHeaderProps {
  shipmentId: string;
  status: ShipmentStatus;
  sender: {
    name: string;
    address: string;
  };
  receiver: {
    name: string;
    address: string;
  };
  createdAt: string;
  expectedDelivery: string;
  trackingNumber?: string;
  stellarTxHash?: string;
  priority?: 'URGENT' | 'STANDARD' | 'ECONOMY';
  userRole?: 'company' | 'customer';
  onTrack?: () => void;
  onDownloadProof?: () => void;
  onShare?: () => void;
  onUpdatePriority?: (priority: 'URGENT' | 'STANDARD' | 'ECONOMY') => void;
}

export const ShipmentHeader: React.FC<ShipmentHeaderProps> = ({
  shipmentId,
  status,
  sender,
  receiver,
  createdAt,
  expectedDelivery,
  trackingNumber,
  stellarTxHash,
  priority,
  userRole = 'customer',
  onTrack = () => console.log('Track clicked'),
  onDownloadProof = () => console.log('Download Proof clicked'),
  onShare = () => console.log('Share clicked'),
  onUpdatePriority,
}) => {
  const [printing, setPrinting] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const isCompanyUser = userRole === 'company';

  return (
    <header className="shipment-header">
      <div className="shipment-header-content">
        {/* Left Section - Shipment ID and Status */}
        <section className="shipment-header-left">
          <div className="shipment-id-section">
            <h1 className="shipment-id">#{shipmentId}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={status} />
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
          </div>
        </section>

        {/* Center Section - Sender and Receiver Details */}
        <section className="shipment-header-center">
          <div className="shipment-parties">
            <div className="party-info">
              <h3 className="party-label">From</h3>
              <p className="party-name">{sender.name}</p>
              <p className="party-address">{sender.address}</p>
            </div>

            <div className="route-arrow">
              <MapPin size={16} />
            </div>

            <div className="party-info">
              <h3 className="party-label">To</h3>
              <p className="party-name">{receiver.name}</p>
              <p className="party-address">{receiver.address}</p>
            </div>
          </div>

          <div className="shipment-dates">
            <div className="date-info">
              <span className="date-label">Created:</span>
              <span className="date-value">{safeFormatDate(createdAt)}</span>
            </div>
            <div className="date-info">
              <span className="date-label">Expected Delivery:</span>
              <span className="date-value">{safeFormatDate(expectedDelivery)}</span>
            </div>
          </div>
        </section>

        {/* Right Section - Action Buttons */}
        <section className="shipment-header-right">
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={onTrack}
              aria-label="Track shipment"
            >
              <MapPin size={16} />
              Track
            </button>
            <button
              className="action-btn secondary"
              onClick={onDownloadProof}
              aria-label="Download proof of delivery"
            >
              <Download size={16} />
              Download Proof
            </button>
            <button
              className="action-btn secondary"
              onClick={onShare}
              aria-label="Share shipment details"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              className="action-btn secondary"
              onClick={() => setPrinting(true)}
              aria-label="Print shipment receipt"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </div>
        </section>
      </div>

      {printing && (
        <ShipmentPrintView
          data={{
            shipmentId,
            trackingNumber,
            status,
            sender,
            receiver,
            createdAt: safeFormatDate(createdAt),
            expectedDelivery: safeFormatDate(expectedDelivery),
            stellarTxHash,
          }}
          onClose={() => setPrinting(false)}
        />
      )}
    </header>
  );
};

export default ShipmentHeader;
