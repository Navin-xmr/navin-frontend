import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Milestone {
  name: string;
  timestamp: string;
  location: string;
  status: string;
}

export interface ShipmentPrintData {
  shipmentId: string;
  trackingNumber?: string;
  status: string;
  sender: { name: string; address: string };
  receiver: { name: string; address: string };
  createdAt?: string;
  expectedDelivery?: string;
  milestones?: Milestone[];
  stellarTxHash?: string;
  deliveryProof?: string;
}

interface ShipmentPrintViewProps {
  data: ShipmentPrintData;
  onClose: () => void;
}

const ShipmentPrintView: React.FC<ShipmentPrintViewProps> = ({ data, onClose }) => {
  const didPrint = useRef(false);

  useEffect(() => {
    if (didPrint.current) return;
    didPrint.current = true;

    const timer = setTimeout(() => {
      window.print();
      onClose();
    }, 150);

    return () => clearTimeout(timer);
  }, [onClose]);

  const content = (
    <div
      id="shipment-print-root"
      className="hidden print:block p-8 font-sans text-black bg-white max-w-[210mm] mx-auto"
      style={{ fontFamily: 'Arial, sans-serif', color: '#111', background: '#fff' }}
    >
      {/* Header */}
      <div style={{ borderBottom: '2px solid #00d4c8', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#00d4c8', letterSpacing: '0.04em' }}>
              NAVIN
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
              Powered by Stellar Soroban
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>SHIPMENT RECEIPT</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
              Bill of Lading
            </div>
          </div>
        </div>
      </div>

      {/* Shipment ID & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Shipment ID
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>{data.shipmentId}</div>
        </div>
        {data.trackingNumber && (
          <div>
            <div style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tracking Number
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{data.trackingNumber}</div>
          </div>
        )}
        <div>
          <div style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Status
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#00a896' }}>
            {data.status.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      {/* Sender / Receiver */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          padding: '14px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Sender
          </div>
          <div style={{ fontWeight: 600 }}>{data.sender.name}</div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{data.sender.address}</div>
        </div>
        <div style={{ borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
          <div style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Receiver
          </div>
          <div style={{ fontWeight: 600 }}>{data.receiver.name}</div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{data.receiver.address}</div>
        </div>
      </div>

      {/* Dates */}
      {(data.createdAt || data.expectedDelivery) && (
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginBottom: '20px',
            fontSize: '12px',
          }}
        >
          {data.createdAt && (
            <div>
              <span style={{ color: '#777', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '10px' }}>
                Created
              </span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{data.createdAt}</div>
            </div>
          )}
          {data.expectedDelivery && (
            <div>
              <span style={{ color: '#777', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '10px' }}>
                Expected Delivery
              </span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{data.expectedDelivery}</div>
            </div>
          )}
        </div>
      )}

      {/* Milestone History */}
      {data.milestones && data.milestones.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
            Milestone History
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#444' }}>Event</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#444' }}>Timestamp</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#444' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {data.milestones.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 8px' }}>{m.name}</td>
                  <td style={{ padding: '6px 8px', color: '#555' }}>{m.timestamp}</td>
                  <td style={{ padding: '6px 8px', color: '#555' }}>{m.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delivery Proof */}
      {data.deliveryProof && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Proof of Delivery
          </div>
          <div style={{ fontSize: '12px', color: '#555' }}>{data.deliveryProof}</div>
        </div>
      )}

      {/* Stellar TX Reference */}
      {data.stellarTxHash && (
        <div
          style={{
            background: '#f0fffe',
            border: '1px solid #b2f0ec',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#006b63', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Stellar Transaction Reference
          </div>
          <div style={{ fontSize: '10px', wordBreak: 'break-all', color: '#333' }}>
            {data.stellarTxHash}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', fontSize: '10px', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
        <span>Generated by Navin — Blockchain-Verified Logistics</span>
        <span>Powered by Stellar Soroban</span>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ShipmentPrintView;
