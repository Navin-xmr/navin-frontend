import React from 'react';
import { useParams } from 'react-router-dom';
import ShipmentHeader from './sections/ShipmentHeader/ShipmentHeader';
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
    recipientSignatureName: 'Jordan Smith',
    uploadedAt: '2024-04-22T15:12:00Z',
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

  const handleShare = () => {
    console.log('Sharing shipment:', id);
    // Implement share functionality
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadProof = () => {
    if (shipmentData.deliveryProof?.url) {
      window.open(shipmentData.deliveryProof.url, '_blank', 'noopener,noreferrer');
      return;
    }

    console.log('No proof available for shipment:', id);
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

      <section
        className="delivery-proof-section"
        style={{
          padding: '24px',
          maxWidth: '860px',
          margin: '0 auto',
          background: 'var(--surface)',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          marginTop: '24px',
        }}
      >
        <h2 style={{ marginBottom: '16px' }}>Delivery Proof</h2>
        {shipmentData.deliveryProof ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <strong>Recipient Signature:</strong>{' '}
              {shipmentData.deliveryProof.recipientSignatureName}
            </div>
            <div>
              <strong>Uploaded At:</strong>{' '}
              {formatDate(shipmentData.deliveryProof.uploadedAt)}
            </div>
            <div>
              <a
                href={shipmentData.deliveryProof.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--primary)', textDecoration: 'underline' }}
              >
                View delivery proof document
              </a>
            </div>
            <button
              type="button"
              onClick={handleDownloadProof}
              style={{
                alignSelf: 'start',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Download proof
            </button>
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>
            Delivery proof is not available for this shipment yet.
          </div>
        )}
      </section>
    </div>
  );
};

export default ShipmentDetail;