import React from "react";
import { useNavigate } from "react-router-dom";
import "./ActiveShipments.css";

interface ActiveShipment {
  id: string;
  status: "In Transit" | "Pending Pickup" | "Out for Delivery" | "Delayed";
  origin: string;
  destination: string;
  estimatedDelivery: string;
}

const MOCK_ACTIVE_SHIPMENTS: ActiveShipment[] = [
  {
    id: "SHP-2001",
    status: "In Transit",
    origin: "Singapore",
    destination: "Los Angeles",
    estimatedDelivery: "2026-02-28",
  },
  {
    id: "SHP-2002",
    status: "Out for Delivery",
    origin: "Dubai",
    destination: "London",
    estimatedDelivery: "2026-02-24",
  },
  {
    id: "SHP-2003",
    status: "Pending Pickup",
    origin: "Shanghai",
    destination: "Rotterdam",
    estimatedDelivery: "2026-03-05",
  },
  {
    id: "SHP-2004",
    status: "Delayed",
    origin: "Mumbai",
    destination: "New York",
    estimatedDelivery: "2026-03-02",
  },
];

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
};

const ActiveShipments: React.FC = () => {
  const navigate = useNavigate();

  const handleTrack = (shipmentId: string) => {
    navigate(`/shipments/${shipmentId}`);
  };

  return (
    <div className="active-shipments">
      <h2 className="active-shipments-title">Active Shipments</h2>
      <div className="shipment-cards-grid">
        {MOCK_ACTIVE_SHIPMENTS.map((shipment) => (
          <div key={shipment.id} className="shipment-card">
            <div className="shipment-card-header">
              <span className="shipment-id">{shipment.id}</span>
              <span
                className={`status-badge status-${shipment.status.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {shipment.status}
              </span>
            </div>
            <div className="shipment-route">
              <span className="route-location">{shipment.origin}</span>
              <span className="route-arrow">→</span>
              <span className="route-location">{shipment.destination}</span>
            </div>
            <div className="shipment-eta">
              <span className="eta-label">Est. Delivery:</span>
              <span className="eta-date">
                {formatDate(shipment.estimatedDelivery)}
              </span>
            </div>
            <button
              type="button"
              className="track-button"
              onClick={() => handleTrack(shipment.id)}
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
