import { safeFormatDate } from '../../../../utils/safeFormat';
import React, { useState } from 'react';
import { Download, Share2, MapPin, Printer, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../../../components/ui/StatusBadge/StatusBadge';
import PriorityBadge from '../../../../components/shipment/PriorityBadge/PriorityBadge';
import Modal from '../../../../components/common/Modal/Modal';
import DisputeForm from '../DisputeForm/DisputeForm';
import type { ExistingDispute } from '../DisputeForm/DisputeForm';
import type { ShipmentStatus } from '../../../../services/api/endpoints/shipments';
import type { ShipmentPriority } from '../../../../api/shipmentApi';
import ShipmentPrintView from '../PrintView/ShipmentPrintView';
import './ShipmentHeader.css';

export interface ShipmentHeaderProps {
  shipmentId: string;
  status: ShipmentStatus;
  priority?: ShipmentPriority;
  onChangePriority?: (priority: ShipmentPriority) => void;
  existingDispute?: ExistingDispute;
  sender: { name: string; address: string };
  receiver: { name: string; address: string };
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
  priority,
  onChangePriority,
  existingDispute,
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
  const [disputeOpen, setDisputeOpen] = useState(false);

  const canRaiseDispute = status === 'DELIVERED' && !existingDispute;

  return (
    <header className="shipment-header">
      <div className="shipment-header-content">
        <section className="shipment-header-left">
          <div className="shipment-id-section">
            <h1 className="shipment-id">#{shipmentId}</h1>
            <StatusBadge status={status} />
            {priority && (
              <PriorityBadge
                priority={priority}
                editable={!!onChangePriority}
                onChangePriority={onChangePriority}
              />
            )}
          </div>
        </section>

        <section className="shipment-header-center">
          <div className="shipment-parties">
            <div className="party-info">
              <h3 className="party-label">From</h3>
              <p className="party-name">{sender.name}</p>
              <p className="party-address">{sender.address}</p>
            </div>
            <div className="route-arrow"><MapPin size={16} /></div>
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

        <section className="shipment-header-right">
          <div className="action-buttons">
            <button className="action-btn primary" onClick={onTrack} aria-label="Track shipment">
              <MapPin size={16} /> Track
            </button>
            <button className="action-btn secondary" onClick={onDownloadProof} aria-label="Download proof of delivery">
              <Download size={16} /> Download Proof
            </button>
            <button className="action-btn secondary" onClick={onShare} aria-label="Share shipment details">
              <Share2 size={16} /> Share
            </button>
            <button className="action-btn secondary" onClick={() => setPrinting(true)} aria-label="Print shipment receipt">
              <Printer size={16} /> Print Receipt
            </button>
            {(canRaiseDispute || existingDispute) && (
              <button
                className="action-btn secondary"
                onClick={() => setDisputeOpen(true)}
                aria-label="Raise or view dispute"
              >
                <AlertCircle size={16} />
                {existingDispute ? 'View Dispute' : 'Raise Dispute'}
              </button>
            )}
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

      <Modal
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        title={existingDispute ? 'Dispute Status' : 'Raise a Dispute'}
        size="md"
      >
        <DisputeForm
          shipmentId={shipmentId}
          existingDispute={existingDispute}
          onSuccess={() => setDisputeOpen(false)}
        />
      </Modal>
    </header>
  );
};

export default ShipmentHeader;
