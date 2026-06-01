import React from 'react';
import { FileCheck, Download, Calendar, User } from 'lucide-react';
import { DeliveryProof as DeliveryProofData } from '../../../../api/shipmentApi';
import './DeliveryProof.css';

interface DeliveryProofProps {
  deliveryProof?: DeliveryProofData | null;
}

export const DeliveryProof: React.FC<DeliveryProofProps> = ({ deliveryProof }) => {
  if (!deliveryProof) {
    return (
      <section className="delivery-proof-section">
        <div className="delivery-proof-empty">
          <FileCheck size={48} className="empty-icon" />
          <p>No delivery proof available yet</p>
        </div>
      </section>
    );
  }

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

  const handleDownload = () => {
    // Open the proof URL in a new tab or initiate download
    window.open(deliveryProof.url, '_blank');
  };

  return (
    <section className="delivery-proof-section">
      <div className="delivery-proof-container">
        <div className="delivery-proof-header">
          <div className="header-title">
            <FileCheck size={24} className="header-icon" />
            <h2>Delivery Proof</h2>
          </div>
          <button
            className="download-btn"
            onClick={handleDownload}
            aria-label="Download delivery proof"
            title="Download delivery proof"
          >
            <Download size={20} />
            Download
          </button>
        </div>

        <div className="delivery-proof-details">
          <div className="proof-item">
            <div className="proof-label">
              <User size={18} />
              <span>Recipient Signature Name</span>
            </div>
            <p className="proof-value">{deliveryProof.recipientSignatureName}</p>
          </div>

          <div className="proof-item">
            <div className="proof-label">
              <Calendar size={18} />
              <span>Upload Date</span>
            </div>
            <p className="proof-value">{formatDate(deliveryProof.uploadedAt)}</p>
          </div>
        </div>

        <div className="proof-preview">
          <p className="preview-label">Proof Document</p>
          <a
            href={deliveryProof.url}
            target="_blank"
            rel="noopener noreferrer"
            className="proof-link"
          >
            View Document
          </a>
        </div>
      </div>
    </section>
  );
};

export default DeliveryProof;
