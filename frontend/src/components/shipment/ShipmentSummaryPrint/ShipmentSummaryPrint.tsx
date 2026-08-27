import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getStatusColorHex } from '../../../utils/shipmentStatus';

export interface PrintMilestone {
  name: string;
  timestamp: string;
  location: string;
  status: string;
  blockchainAddress?: string;
}

export interface PrintCostItem {
  label: string;
  amount: number;
  isDiscount?: boolean;
}

export interface PrintPaymentInfo {
  amount: string;
  tokenSymbol: string;
  status: string;
  transactionHash?: string;
}

export interface PrintSensorSnapshot {
  temperature?: { value: number; unit: string };
  humidity?: { value: number; unit: string };
  location?: { latitude: number; longitude: number };
}

export interface ShipmentSummaryPrintData {
  shipmentId: string;
  trackingNumber?: string;
  status: string;
  priority?: string;
  sender: { name: string; address: string };
  receiver: { name: string; address: string };
  carrier?: string;
  createdAt?: string;
  expectedDelivery?: string;
  milestones?: PrintMilestone[];
  costItems?: PrintCostItem[];
  totalCost?: { amount: number; currency: string };
  payment?: PrintPaymentInfo;
  sensorSnapshot?: PrintSensorSnapshot;
  stellarTxHash?: string;
  deliveryProof?: string;
  notes?: string;
}

export interface ShipmentSummaryPrintProps {
  data: ShipmentSummaryPrintData;
  onClose: () => void;
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * ShipmentSummaryPrint
 *
 * A rich printable summary of a shipment. Renders invisibly in the DOM
 * (only visible in print mode) via a portal, then calls window.print()
 * and notifies the parent via onClose.
 *
 * Includes: shipment metadata, milestone timeline, cost breakdown,
 * payment info, sensor snapshot, and Stellar transaction reference.
 */
const ShipmentSummaryPrint: React.FC<ShipmentSummaryPrintProps> = ({ data, onClose }) => {
  const didPrint = useRef(false);

  useEffect(() => {
    if (didPrint.current) return;
    didPrint.current = true;

    const timer = setTimeout(() => {
      window.print();
      onClose();
    }, 200);

    return () => clearTimeout(timer);
  }, [onClose]);

  const statusColor = getStatusColorHex(data.status.toUpperCase());
  const printDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = (
    <div
      id="shipment-summary-print-root"
      className="hidden print:block"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#111',
        background: '#fff',
        maxWidth: '210mm',
        margin: '0 auto',
        padding: '24px',
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #00d4c8', paddingBottom: '14px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#00d4c8', letterSpacing: '0.05em' }}>NAVIN</div>
          <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>Blockchain-Verified Logistics · Powered by Stellar Soroban</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}>SHIPMENT SUMMARY</div>
          <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>Printed: {printDate}</div>
        </div>
      </div>

      {/* ── Shipment ID, Status & Priority ── */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Shipment ID</div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>{data.shipmentId}</div>
        </div>
        {data.trackingNumber && (
          <div>
            <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tracking #</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{data.trackingNumber}</div>
          </div>
        )}
        <div>
          <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: statusColor }}>{formatStatus(data.status)}</div>
        </div>
        {data.priority && (
          <div>
            <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Priority</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{data.priority}</div>
          </div>
        )}
        {data.carrier && (
          <div>
            <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Carrier</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{data.carrier}</div>
          </div>
        )}
      </div>

      {/* ── Sender / Receiver ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', border: '1px solid #ddd', borderRadius: '6px', padding: '14px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>From (Sender)</div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{data.sender.name}</div>
          <div style={{ color: '#555', marginTop: '2px', fontSize: '11px' }}>{data.sender.address}</div>
        </div>
        <div style={{ borderLeft: '1px solid #eee', paddingLeft: '16px' }}>
          <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>To (Receiver)</div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{data.receiver.name}</div>
          <div style={{ color: '#555', marginTop: '2px', fontSize: '11px' }}>{data.receiver.address}</div>
        </div>
      </div>

      {/* ── Dates ── */}
      {(data.createdAt || data.expectedDelivery) && (
        <div style={{ display: 'flex', gap: '32px', marginBottom: '18px' }}>
          {data.createdAt && (
            <div>
              <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Created</div>
              <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>{data.createdAt}</div>
            </div>
          )}
          {data.expectedDelivery && (
            <div>
              <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Expected Delivery</div>
              <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>{data.expectedDelivery}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Milestone Timeline ── */}
      {data.milestones && data.milestones.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '10px' }}>
            Milestone Timeline
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 700, color: '#333', borderBottom: '1px solid #ddd' }}>Event</th>
                <th style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 700, color: '#333', borderBottom: '1px solid #ddd' }}>Timestamp</th>
                <th style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 700, color: '#333', borderBottom: '1px solid #ddd' }}>Location</th>
                <th style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 700, color: '#333', borderBottom: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.milestones.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '5px 8px', fontWeight: m.status === 'current' ? 700 : 400 }}>{m.name}</td>
                  <td style={{ padding: '5px 8px', color: '#555' }}>{m.timestamp}</td>
                  <td style={{ padding: '5px 8px', color: '#555' }}>{m.location}</td>
                  <td style={{ padding: '5px 8px' }}>
                    <span style={{ color: m.status === 'completed' ? '#10B981' : m.status === 'current' ? '#3B82F6' : '#9CA3AF', fontWeight: 600 }}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Blockchain references (compact) */}
          {data.milestones.some((m) => m.blockchainAddress && m.blockchainAddress !== 'pending...') && (
            <div style={{ marginTop: '8px', fontSize: '9px', color: '#777' }}>
              <strong>On-chain references: </strong>
              {data.milestones
                .filter((m) => m.blockchainAddress && m.blockchainAddress !== 'pending...')
                .map((m, i) => (
                  <span key={i}>{m.name}: {m.blockchainAddress}{i < data.milestones!.filter((x) => x.blockchainAddress && x.blockchainAddress !== 'pending...').length - 1 ? ' · ' : ''}</span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Cost Breakdown ── */}
      {data.costItems && data.costItems.length > 0 && (
        <div style={{ marginBottom: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '8px' }}>
              Cost Breakdown
            </div>
            {data.costItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: i < data.costItems!.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <span style={{ color: item.isDiscount ? '#10B981' : '#444' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: item.isDiscount ? '#10B981' : '#111' }}>
                  {item.isDiscount ? '−' : ''}${item.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {data.totalCost && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', borderTop: '2px solid #111', marginTop: '4px', fontWeight: 800, fontSize: '13px' }}>
                <span>Total</span>
                <span>{data.totalCost.currency} {data.totalCost.amount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* ── Payment Info ── */}
          {data.payment && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '8px' }}>
                Payment
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#666' }}>Amount</span>
                <span style={{ fontWeight: 700 }}>{data.payment.amount} {data.payment.tokenSymbol}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#666' }}>Status</span>
                <span style={{ fontWeight: 700, color: data.payment.status === 'released' ? '#10B981' : '#3B82F6' }}>
                  {data.payment.status.charAt(0).toUpperCase() + data.payment.status.slice(1)}
                </span>
              </div>
              {data.payment.transactionHash && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>TX Hash</div>
                  <div style={{ fontSize: '8px', wordBreak: 'break-all', color: '#444' }}>{data.payment.transactionHash}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sensor Snapshot ── */}
      {data.sensorSnapshot && (
        <div style={{ marginBottom: '18px', background: '#f9fffe', border: '1px solid #c6f0ed', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: '#006b63' }}>
            IoT Sensor Snapshot
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {data.sensorSnapshot.temperature && (
              <div>
                <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Temperature</div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{data.sensorSnapshot.temperature.value}{data.sensorSnapshot.temperature.unit}</div>
              </div>
            )}
            {data.sensorSnapshot.humidity && (
              <div>
                <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Humidity</div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{data.sensorSnapshot.humidity.value}{data.sensorSnapshot.humidity.unit}</div>
              </div>
            )}
            {data.sensorSnapshot.location && (
              <div>
                <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last GPS</div>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>
                  {data.sensorSnapshot.location.latitude.toFixed(4)}, {data.sensorSnapshot.location.longitude.toFixed(4)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delivery Proof ── */}
      {data.deliveryProof && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '6px' }}>
            Proof of Delivery
          </div>
          <div style={{ fontSize: '11px', color: '#444' }}>{data.deliveryProof}</div>
        </div>
      )}

      {/* ── Notes ── */}
      {data.notes && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '6px' }}>
            Notes
          </div>
          <div style={{ fontSize: '11px', color: '#444', whiteSpace: 'pre-wrap' }}>{data.notes}</div>
        </div>
      )}

      {/* ── Stellar TX Reference ── */}
      {data.stellarTxHash && (
        <div style={{ background: '#f0fffe', border: '1px solid #b2f0ec', borderRadius: '6px', padding: '12px', marginBottom: '18px' }}>
          <div style={{ fontSize: '9px', color: '#006b63', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontWeight: 700 }}>
            Stellar Transaction Reference
          </div>
          <div style={{ fontSize: '9px', wordBreak: 'break-all', color: '#333' }}>{data.stellarTxHash}</div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '9px', color: '#aaa' }}>Generated by Navin — Blockchain-Verified Logistics</span>
        <span style={{ fontSize: '9px', color: '#aaa' }}>Powered by Stellar Soroban · navin.io</span>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ShipmentSummaryPrint;
