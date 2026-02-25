import React from 'react';
import './ShipmentDetailHeader.css';

export type UserRole = 'company' | 'customer';
export type ShipmentStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';

interface ShipmentDetailHeaderProps {
  shipmentId: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  eta: string;
  userRole: UserRole;
  onUpdateStatus?: () => void;
  onTrack?: () => void;
}

const statusColors: Record<ShipmentStatus, string> = {
  Pending: '#f59e0b',
  'In Transit': '#3b82f6',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
};

const ShipmentDetailHeader: React.FC<ShipmentDetailHeaderProps> = ({
  shipmentId,
  status,
  origin,
  destination,
  eta,
  userRole,
  onUpdateStatus,
  onTrack,
}) => {
  return (
    <div className="sdh-container">
      <div className="sdh-top">
        <h1 className="sdh-id">Shipment #{shipmentId}</h1>
        <span className="sdh-badge" style={{ backgroundColor: statusColors[status] }}>
          {status}
        </span>
      </div>

      <div className="sdh-route">
        <span className="sdh-location">{origin}</span>
        <span className="sdh-arrow">&rarr;</span>
        <span className="sdh-location">{destination}</span>
      </div>

      <div className="sdh-eta">
        <span>Expected Delivery: </span>
        <strong>{eta}</strong>
      </div>

      <div className="sdh-actions">
        {userRole === 'company' && (
          <button className="sdh-btn sdh-btn--primary" onClick={onUpdateStatus}>
            Update Status
          </button>
        )}
        {userRole === 'customer' && (
          <button className="sdh-btn sdh-btn--secondary" onClick={onTrack}>
            Track Shipment
          </button>
        )}
      </div>
    </div>
  );
};

export default ShipmentDetailHeader;
