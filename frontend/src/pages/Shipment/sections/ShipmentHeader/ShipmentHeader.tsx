import { safeFormatDate } from '../../../../utils/safeFormat';
import React from 'react';
import { Download, Share2, MapPin } from 'lucide-react';
import { StatusBadge } from '../../../../components/ui/StatusBadge/StatusBadge';
import type { ShipmentStatus } from '../../../../services/api/endpoints/shipments';
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
  onTrack?: () => void;
  onDownloadProof?: () => void;
  onShare?: () => void;
}

export const ShipmentHeader: React.FC<ShipmentHeaderProps> = ({
  shipmentId,
  status,
  sender,
  receiver,
  createdAt,
  expectedDelivery,
  onTrack = () => console.log('Track clicked'),
  onDownloadProof = () => console.log('Download Proof clicked'),
  onShare = () => console.log('Share clicked'),
}) => {
  return (
    <header className="shipment-header">
      <div className="shipment-header-content">
        {/* Left Section - Shipment ID and Status */}
        <section className="shipment-header-left">
          <div className="shipment-id-section">
            <h1 className="shipment-id">#{shipmentId}</h1>
            <StatusBadge status={status} />
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
          </div>
        </section>
      </div>
    </header>
  );
};

export default ShipmentHeader;
