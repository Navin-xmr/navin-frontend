import React from "react";
import { useNavigate } from "react-router-dom";

interface ActiveShipment {
  id: string;
  status: "In Transit" | "Pending Pickup" | "Out for Delivery" | "Delayed";
  origin: string;
  destination: string;
  estimatedDelivery: string;
}

const MOCK_ACTIVE_SHIPMENTS: ActiveShipment[] = [
  { id: "SHP-2001", status: "In Transit", origin: "Singapore", destination: "Los Angeles", estimatedDelivery: "2026-02-28" },
  { id: "SHP-2002", status: "Out for Delivery", origin: "Dubai", destination: "London", estimatedDelivery: "2026-02-24" },
  { id: "SHP-2003", status: "Pending Pickup", origin: "Shanghai", destination: "Rotterdam", estimatedDelivery: "2026-03-05" },
  { id: "SHP-2004", status: "Delayed", origin: "Mumbai", destination: "New York", estimatedDelivery: "2026-03-02" },
];

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateString));

const statusStyles: Record<ActiveShipment["status"], string> = {
  "In Transit":       "bg-blue-100 text-blue-800",
  "Pending Pickup":   "bg-yellow-100 text-yellow-800",
  "Out for Delivery": "bg-green-100 text-green-800",
  "Delayed":          "bg-red-100 text-red-800",
};

const ActiveShipments: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 md:p-4">
      <h2 className="text-2xl font-semibold mb-6 text-[#1a1a1a] md:text-xl">Active Shipments</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-1 md:gap-4">
        {MOCK_ACTIVE_SHIPMENTS.map((shipment) => (
          <div
            key={shipment.id}
            data-testid="active-shipment-card"
            className="bg-white border border-[#e5e7eb] rounded-lg p-6 flex flex-col gap-4 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base text-[#1a1a1a]">{shipment.id}</span>
              <span className={`px-3 py-1 rounded-xl text-xs font-medium capitalize ${statusStyles[shipment.status]}`}>
                {shipment.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#4b5563]">
              <span className="font-medium">{shipment.origin}</span>
              <span className="text-[#9ca3af] text-base">→</span>
              <span className="font-medium">{shipment.destination}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-[#6b7280]">Est. Delivery:</span>
              <span className="text-[#1a1a1a] font-medium">{formatDate(shipment.estimatedDelivery)}</span>
            </div>
            <button
              type="button"
              className="bg-[#2563eb] text-white border-none rounded-md px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors hover:bg-[#1d4ed8] active:bg-[#1e40af]"
              onClick={() => navigate(`/dashboard/shipments/${shipment.id}`)}
            >
              Track
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveShipments;
