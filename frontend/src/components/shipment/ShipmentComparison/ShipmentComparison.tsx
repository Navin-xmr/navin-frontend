import React, { useState, useMemo } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { MilestoneDetail } from '../MilestoneTimeline/MilestoneTimeline';

export interface ShipmentForComparison {
  id: string;
  shipmentId: string;
  origin: string;
  destination: string;
  status: string;
  milestones: MilestoneDetail[];
  expectedDelivery: string;
  createdAt: string;
}

export interface ShipmentComparisonProps {
  shipments: ShipmentForComparison[];
  onClose: () => void;
  isOpen: boolean;
}

const ShipmentComparison: React.FC<ShipmentComparisonProps> = ({ shipments, onClose, isOpen }) => {
  const [selectedShipments, setSelectedShipments] = useState<Set<string>>(new Set(shipments.slice(0, 2).map(s => s.id)));

  const comparisonData = useMemo(() => {
    const selected = Array.from(selectedShipments)
      .map(id => shipments.find(s => s.id === id))
      .filter(Boolean) as ShipmentForComparison[];

    if (selected.length === 0) return [];

    const comparisonRows: Array<{
      label: string;
      values: (string | React.ReactNode)[];
    }> = [
      {
        label: 'Shipment ID',
        values: selected.map(s => s.shipmentId),
      },
      {
        label: 'Status',
        values: selected.map(s => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            s.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
            s.status === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {s.status}
          </span>
        )),
      },
      {
        label: 'Origin',
        values: selected.map(s => s.origin),
      },
      {
        label: 'Destination',
        values: selected.map(s => s.destination),
      },
      {
        label: 'Created',
        values: selected.map(s => s.createdAt),
      },
      {
        label: 'Expected Delivery',
        values: selected.map(s => s.expectedDelivery),
      },
      {
        label: 'Milestones',
        values: selected.map(s => `${s.milestones.filter(m => m.status === 'completed').length}/${s.milestones.length} completed`),
      },
    ];

    return comparisonRows;
  }, [selectedShipments, shipments]);

  const toggleShipment = (id: string) => {
    setSelectedShipments(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const selected = Array.from(selectedShipments)
    .map(id => shipments.find(s => s.id === id))
    .filter(Boolean) as ShipmentForComparison[];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full md:max-w-4xl md:rounded-2xl bg-background-card border border-border rounded-t-2xl md:border shadow-2xl md:shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Compare Shipments</h2>
            <p className="text-sm text-text-secondary mt-1">
              {selected.length > 0
                ? `Comparing ${selected.length} shipment${selected.length !== 1 ? 's' : ''}`
                : 'Select shipments to compare'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-border/50 rounded-lg transition-colors"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Shipment Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Select Shipments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {shipments.map(shipment => (
                  <button
                    key={shipment.id}
                    onClick={() => toggleShipment(shipment.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedShipments.has(shipment.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border/70 hover:bg-border/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-text-primary">{shipment.shipmentId}</p>
                        <p className="text-xs text-text-secondary mt-1">{shipment.origin}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedShipments.has(shipment.id)}
                        onChange={() => toggleShipment(shipment.id)}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                        aria-label={`Select ${shipment.shipmentId}`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            {selected.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {comparisonData.map((row, idx) => (
                        <tr key={idx} className={`border-b border-border last:border-b-0 ${idx % 2 === 0 ? 'bg-border/5' : ''}`}>
                          <td className="px-4 py-3 font-medium text-text-primary text-sm sticky left-0 bg-background-card z-10 min-w-[120px]">
                            {row.label}
                          </td>
                          {row.values.map((value, idx) => (
                            <td key={idx} className="px-4 py-3 text-text-secondary text-sm">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selected.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ChevronRight className="w-8 h-8 text-text-secondary/30 mb-3" />
                <p className="text-text-secondary">Select at least 2 shipments to compare</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selected.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-border/30 transition-colors font-medium text-text-secondary"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Export comparison data as CSV
                const headers = ['', ...Array.from(selectedShipments).map(id =>
                  shipments.find(s => s.id === id)?.shipmentId || ''
                )];
                const rows = comparisonData.map(row => [row.label, ...row.values]);
                const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'shipment-comparison.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors font-medium text-primary"
            >
              Export Comparison
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentComparison;
