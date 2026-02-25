import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ShipmentDetailHeader, {
  type ShipmentStatus,
  type UserRole,
} from './ShipmentDetailHeader/ShipmentDetailHeader';
import './ShipmentDetail.css';

interface ShipmentDetailData {
  id: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  eta: string;
}

const SHIPMENT_DETAILS: Record<string, ShipmentDetailData> = {
  SHP001: {
    id: 'SHP001',
    status: 'In Transit',
    origin: 'Austin, TX',
    destination: 'Denver, CO',
    eta: 'Mar 02, 2026',
  },
  SHP002: {
    id: 'SHP002',
    status: 'Pending',
    origin: 'San Jose, CA',
    destination: 'Seattle, WA',
    eta: 'Mar 05, 2026',
  },
  SHP003: {
    id: 'SHP003',
    status: 'Delivered',
    origin: 'Chicago, IL',
    destination: 'Boston, MA',
    eta: 'Feb 20, 2026',
  },
};

const ShipmentDetail: React.FC = () => {
  const { id = 'SHP001' } = useParams();
  const [searchParams] = useSearchParams();

  const userRole: UserRole = searchParams.get('role') === 'customer' ? 'customer' : 'company';

  const shipment = SHIPMENT_DETAILS[id] ?? {
    id,
    status: 'Pending' as const,
    origin: 'Unknown Origin',
    destination: 'Unknown Destination',
    eta: 'TBD',
  };

  const handleUpdateStatus = () => {
    console.log(`Update status requested for shipment ${shipment.id}`);
  };

  const handleTrack = () => {
    console.log(`Track requested for shipment ${shipment.id}`);
  };

  return (
    <section className="shipment-detail-page">
      <ShipmentDetailHeader
        shipmentId={shipment.id}
        status={shipment.status}
        origin={shipment.origin}
        destination={shipment.destination}
        eta={shipment.eta}
        userRole={userRole}
        onUpdateStatus={handleUpdateStatus}
        onTrack={handleTrack}
      />
    </section>
  );
};

export default ShipmentDetail;
