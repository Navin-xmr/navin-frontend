import React from 'react';
import { useParams } from 'react-router-dom';
import ShipmentHeader from './sections/ShipmentHeader/ShipmentHeader';
import DeliveryProof from './sections/DeliveryProof/DeliveryProof';
import { ShipmentStatus } from '../../components/ui/StatusBadge';

// Mock data for demonstration
const MOCK_SHIPMENT_DATA = {
  id: 'SHP-2024-001234',
  status: 'In Transit' as ShipmentStatus,
  sender: {
    name: 'Acme Corporation',
    address: '123 Business Ave, New York, NY 10001',
  },
  receiver: {
    name: 'Global Logistics Ltd',
    address: '456 Commerce St, Los Angeles, CA 90210',
  },
  createdAt: '2024-04-15T10:30:00Z',
  expectedDelivery: '2024-04-22T16:00:00Z',
  deliveryProof: {
    url: 'https://example.com/proof/SHP-2024-001234.pdf',
    recipientSignatureName: 'John Smith',
    uploadedAt: '2024-04-22T14:35:00Z',
  },
};

const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch shipment data based on the ID
  const shipmentData = MOCK_SHIPMENT_DATA;

  const handleTrack = () => {
    console.log('Tracking shipment:', id);
    // Implement tracking functionality
  };

  const handleDownloadProof = () => {
    console.log('Downloading proof for shipment:', id);
    // Implement download proof functionality
  };

  const handleShare = () => {
    console.log('Sharing shipment:', id);
    // Implement share functionality
  };

  return (
    <div className="shipment-detail-page">
      <ShipmentHeader
        shipmentId={shipmentData.id}
        status={shipmentData.status}
        sender={shipmentData.sender}
        receiver={shipmentData.receiver}
        createdAt={shipmentData.createdAt}
        expectedDelivery={shipmentData.expectedDelivery}
        onTrack={handleTrack}
        onDownloadProof={handleDownloadProof}
        onShare={handleShare}
      />
      
      <DeliveryProof deliveryProof={shipmentData.deliveryProof} />

      {/* Additional shipment detail sections would go here */}
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Additional shipment details and tracking information will be displayed here.
      </div>
    </div>
  );
};

export default ShipmentDetail;