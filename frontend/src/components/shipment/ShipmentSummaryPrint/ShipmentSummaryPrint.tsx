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
      className="hidden print:block font-sans text-[#111] bg-white max-w-[210mm] mx-auto px-6 py-6 text-[12px] leading-[1.5]"
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#00d4c8] pb-[14px] mb-[18px]">
        <div>
          <div className="text-[28px] font-black text-[#00d4c8] tracking-[0.05em]">NAVIN</div>
          <div className="text-[10px] text-[#666] mt-0.5">Blockchain-Verified Logistics · Powered by Stellar Soroban</div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-bold text-[#111]">SHIPMENT SUMMARY</div>
          <div className="text-[10px] text-[#666] mt-1">Printed: {printDate}</div>
        </div>
      </div>

      {/* Shipment ID, Status & Priority */}
      <div className="flex gap-6 mb-[18px] flex-wrap">
        <div>
          <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Shipment ID</div>
          <div className="text-[22px] font-extrabold">{data.shipmentId}</div>
        </div>
        {data.trackingNumber && (
          <div>
            <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Tracking #</div>
            <div className="text-[14px] font-semibold">{data.trackingNumber}</div>
          </div>
        )}
        <div>
          <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Status</div>
          {/* statusColor is a runtime hex from getStatusColorHex — cannot be a static Tailwind class */}
          <div className="text-[14px] font-bold" style={{ color: statusColor }}>{formatStatus(data.status)}</div>
        </div>
        {data.priority && (
          <div>
            <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Priority</div>
            <div className="text-[13px] font-semibold">{data.priority}</div>
          </div>
        )}
        {data.carrier && (
          <div>
            <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Carrier</div>
            <div className="text-[13px] font-semibold">{data.carrier}</div>
          </div>
        )}
      </div>

      {/* Sender / Receiver */}
      <div className="grid grid-cols-2 gap-4 border border-[#ddd] rounded-md p-[14px] mb-[18px]">
        <div>
          <div className="text-[9px] text-[#888] uppercase tracking-[0.1em] mb-1.5">From (Sender)</div>
          <div className="font-semibold text-[13px]">{data.sender.name}</div>
          <div className="text-[#555] mt-0.5 text-[11px]">{data.sender.address}</div>
        </div>
        <div className="border-l border-[#eee] pl-4">
          <div className="text-[9px] text-[#888] uppercase tracking-[0.1em] mb-1.5">To (Receiver)</div>
          <div className="font-semibold text-[13px]">{data.receiver.name}</div>
          <div className="text-[#555] mt-0.5 text-[11px]">{data.receiver.address}</div>
        </div>
      </div>

      {/* Dates */}
      {(data.createdAt || data.expectedDelivery) && (
        <div className="flex gap-8 mb-[18px]">
          {data.createdAt && (
            <div>
              <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Created</div>
              <div className="font-semibold text-[12px] mt-0.5">{data.createdAt}</div>
            </div>
          )}
          {data.expectedDelivery && (
            <div>
              <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Expected Delivery</div>
              <div className="font-semibold text-[12px] mt-0.5">{data.expectedDelivery}</div>
            </div>
          )}
        </div>
      )}

      {/* Milestone Timeline */}
      {data.milestones && data.milestones.length > 0 && (
        <div className="mb-[18px]">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] border-b border-[#ddd] pb-1.5 mb-2.5">
            Milestone Timeline
          </div>
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-[#f7f7f7]">
                <th className="text-left px-2 py-[5px] font-bold text-[#333] border-b border-[#ddd]">Event</th>
                <th className="text-left px-2 py-[5px] font-bold text-[#333] border-b border-[#ddd]">Timestamp</th>
                <th className="text-left px-2 py-[5px] font-bold text-[#333] border-b border-[#ddd]">Location</th>
                <th className="text-left px-2 py-[5px] font-bold text-[#333] border-b border-[#ddd]">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.milestones.map((m, i) => (
                <tr key={i} className={`border-b border-[#eee] ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                  <td className={`px-2 py-[5px] ${m.status === 'current' ? 'font-bold' : 'font-normal'}`}>{m.name}</td>
                  <td className="px-2 py-[5px] text-[#555]">{m.timestamp}</td>
                  <td className="px-2 py-[5px] text-[#555]">{m.location}</td>
                  <td className="px-2 py-[5px]">
                    <span
                      className={`font-semibold ${
                        m.status === 'completed'
                          ? 'text-[#10B981]'
                          : m.status === 'current'
                            ? 'text-[#3B82F6]'
                            : 'text-[#9CA3AF]'
                      }`}
                    >
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.milestones.some((m) => m.blockchainAddress && m.blockchainAddress !== 'pending...') && (
            <div className="mt-2 text-[9px] text-[#777]">
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

      {/* Cost Breakdown */}
      {data.costItems && data.costItems.length > 0 && (
        <div className="mb-[18px] grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] border-b border-[#ddd] pb-1.5 mb-2">
              Cost Breakdown
            </div>
            {data.costItems.map((item, i) => (
              <div
                key={i}
                className={`flex justify-between py-[3px] ${i < data.costItems!.length - 1 ? 'border-b border-[#f0f0f0]' : ''}`}
              >
                <span className={item.isDiscount ? 'text-[#10B981]' : 'text-[#444]'}>{item.label}</span>
                <span className={`font-semibold ${item.isDiscount ? 'text-[#10B981]' : 'text-[#111]'}`}>
                  {item.isDiscount ? '-' : ''}${item.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {data.totalCost && (
              <div className="flex justify-between pt-1.5 border-t-2 border-[#111] mt-1 font-extrabold text-[13px]">
                <span>Total</span>
                <span>{data.totalCost.currency} {data.totalCost.amount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Payment Info */}
          {data.payment && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] border-b border-[#ddd] pb-1.5 mb-2">
                Payment
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-[#666]">Amount</span>
                <span className="font-bold">{data.payment.amount} {data.payment.tokenSymbol}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-[#666]">Status</span>
                <span className={`font-bold ${data.payment.status === 'released' ? 'text-[#10B981]' : 'text-[#3B82F6]'}`}>
                  {data.payment.status.charAt(0).toUpperCase() + data.payment.status.slice(1)}
                </span>
              </div>
              {data.payment.transactionHash && (
                <div className="mt-1.5">
                  <div className="text-[9px] text-[#888] uppercase tracking-[0.08em] mb-0.5">TX Hash</div>
                  <div className="text-[8px] break-all text-[#444]">{data.payment.transactionHash}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sensor Snapshot */}
      {data.sensorSnapshot && (
        <div className="mb-[18px] bg-[#f9fffe] border border-[#c6f0ed] rounded-md p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2 text-[#006b63]">
            IoT Sensor Snapshot
          </div>
          <div className="flex gap-6 flex-wrap">
            {data.sensorSnapshot.temperature && (
              <div>
                <div className="text-[9px] text-[#888] uppercase tracking-[0.08em]">Temperature</div>
                <div className="font-bold text-[14px]">{data.sensorSnapshot.temperature.value}{data.sensorSnapshot.temperature.unit}</div>
              </div>
            )}
            {data.sensorSnapshot.humidity && (
              <div>
                <div className="text-[9px] text-[#888] uppercase tracking-[0.08em]">Humidity</div>
                <div className="font-bold text-[14px]">{data.sensorSnapshot.humidity.value}{data.sensorSnapshot.humidity.unit}</div>
              </div>
            )}
            {data.sensorSnapshot.location && (
              <div>
                <div className="text-[9px] text-[#888] uppercase tracking-[0.08em]">Last GPS</div>
                <div className="font-semibold text-[12px]">
                  {data.sensorSnapshot.location.latitude.toFixed(4)}, {data.sensorSnapshot.location.longitude.toFixed(4)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Proof */}
      {data.deliveryProof && (
        <div className="mb-[18px]">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] border-b border-[#ddd] pb-1.5 mb-1.5">
            Proof of Delivery
          </div>
          <div className="text-[11px] text-[#444]">{data.deliveryProof}</div>
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="mb-[18px]">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] border-b border-[#ddd] pb-1.5 mb-1.5">
            Notes
          </div>
          <div className="text-[11px] text-[#444] whitespace-pre-wrap">{data.notes}</div>
        </div>
      )}

      {/* Stellar TX Reference */}
      {data.stellarTxHash && (
        <div className="bg-[#f0fffe] border border-[#b2f0ec] rounded-md p-3 mb-[18px]">
          <div className="text-[9px] text-[#006b63] uppercase tracking-[0.1em] mb-1 font-bold">
            Stellar Transaction Reference
          </div>
          <div className="text-[9px] break-all text-[#333]">{data.stellarTxHash}</div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[#ddd] pt-2.5 flex justify-between items-center">
        <span className="text-[9px] text-[#aaa]">Generated by Navin — Blockchain-Verified Logistics</span>
        <span className="text-[9px] text-[#aaa]">Powered by Stellar Soroban · navin.io</span>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ShipmentSummaryPrint;
