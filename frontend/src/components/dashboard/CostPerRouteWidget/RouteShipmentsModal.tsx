import React from 'react';
import Modal from '../../common/Modal/Modal';
import type { RouteCostData } from './mockCostPerRouteData';
import { formatCurrency, getRouteMarginPercent, getRouteTotalCost, getMarginColorClass } from './costPerRouteUtils';

interface RouteShipmentsModalProps {
  route: RouteCostData | null;
  onClose: () => void;
}

const RouteShipmentsModal: React.FC<RouteShipmentsModalProps> = ({ route, onClose }) => {
  if (!route) return null;

  const totalCost = getRouteTotalCost(route);
  const margin = getRouteMarginPercent(route);

  return (
    <Modal
      isOpen={!!route}
      onClose={onClose}
      title={`Shipments on ${route.route}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-3">
            <p className="m-0 text-xs text-[#94a3b8]">Total cost</p>
            <p className="m-0 mt-1 font-semibold text-white">{formatCurrency(totalCost)}</p>
          </div>
          <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-3">
            <p className="m-0 text-xs text-[#94a3b8]">Revenue</p>
            <p className="m-0 mt-1 font-semibold text-white">{formatCurrency(route.revenue)}</p>
          </div>
          <div className="rounded-lg border border-[#1e293b] bg-[#0f172a] p-3">
            <p className="m-0 text-xs text-[#94a3b8]">Margin</p>
            <p className={`m-0 mt-1 font-semibold ${getMarginColorClass(margin)}`}>
              {margin.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1e293b]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#0f172a] text-left text-[#94a3b8]">
              <tr>
                <th className="px-4 py-3 font-medium">Tracking #</th>
                <th className="px-4 py-3 font-medium">Shipment ID</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {route.shipments.map((shipment) => (
                <tr key={shipment.id} className="border-t border-[#1e293b] text-[#cbd5e1]">
                  <td className="px-4 py-3">{shipment.trackingNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs">{shipment.id}</td>
                  <td className="px-4 py-3">{formatCurrency(shipment.cost)}</td>
                  <td className="px-4 py-3">{formatCurrency(shipment.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default RouteShipmentsModal;
