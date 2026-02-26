import React, { useState, useEffect } from "react";
import {
  Box,
  Clock,
  CheckCircle2,
  Truck,
  Plus,
  Printer,
  UserPlus,
  MapPin,
  MoreHorizontal,
  Ship,
  Plane,
  Train,
  ShieldCheck,
  AlertTriangle,
  Rocket,
  Menu,
  QrCode,
} from "lucide-react";
import "./CompanyDashboard.css";

const CompanyDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Simulate network fetch
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsLoading(false);
      } catch {
        setHasError(true);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      id: "active",
      label: "Active",
      value: "128",
      trend: "12%",
      trendType: "positive",
      icon: <Truck size={18} />,
    },
    {
      id: "delivered",
      label: "Delivered",
      value: "1,420",
      trend: "5%",
      trendType: "positive",
      icon: <CheckCircle2 size={18} />,
    },
    {
      id: "delayed",
      label: "Delayed",
      value: "12",
      trend: "2%",
      trendType: "negative",
      icon: <Clock size={18} />,
    },
    {
      id: "verified",
      label: "Verified",
      value: "45",
      trend: "0%",
      trendType: "neutral",
      icon: <ShieldCheck size={18} />,
    },
  ];

  const recentShipments = [
    {
      id: "#NVN-9842",
      destination: "40.7128° N",
      status: "IN-TRANSIT",
      statusLabel: "In Transit",
      type: "box",
    },
    {
      id: "#NVN-8711",
      destination: "Terminal B",
      status: "DELIVERED",
      statusLabel: "Delivered",
      type: "train",
    },
    {
      id: "#NVN-4420",
      destination: "Customs Check",
      status: "DELAYED",
      statusLabel: "Delayed",
      type: "plane",
    },
    {
      id: "#NVN-2109",
      destination: "Pacific Route",
      status: "IN-TRANSIT",
      statusLabel: "On Vessel",
      type: "ship",
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "delivered";
      case "IN-TRANSIT":
        return "in-transit";
      case "DELAYED":
        return "delayed";
      default:
        return "pending";
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "ship":
        return <Ship size={20} strokeWidth={1.5} />;
      case "plane":
        return <Plane size={20} strokeWidth={1.5} />;
      case "train":
        return <Train size={20} strokeWidth={1.5} />;
      default:
        return <Box size={20} strokeWidth={1.5} />;
    }
  };

  if (hasError) {
    return (
      <div className="company-dashboard">
        <div className="error-state">
          <AlertTriangle size={48} />
          <h3>Failed to load dashboard</h3>
          <p>There was a problem connecting to the logistics network.</p>
          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      {/* Mobile-only branded header */}
      <div className="mobile-top-bar">
        <div className="mobile-logo">
          <div className="mobile-rocket-box">
            <Rocket size={16} color="#fff" />
          </div>
          <span className="mobile-logo-text">NAVIN</span>
        </div>
        <button className="mobile-hamburger" aria-label="Menu">
          <Menu size={22} color="#fff" />
        </button>
      </div>

      <div className="dashboard-title-area">
        <div className="title-text">
          <h1>Logistics Overview</h1>
          <p>Blockchain-synced real-time data</p>
        </div>
        <div className="live-badge desktop-only-badge">
          Live: <span>Connected</span>
        </div>
      </div>

      {isLoading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="skeleton skeleton-card"></div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-card-modern">
              <div className="stat-header-modern">
                {stat.icon}
                {stat.label}
              </div>
              <div
                className={`stat-value-modern ${stat.id === "delayed" ? "delayed-value" : ""}`}
              >
                {stat.value}
              </div>
              <div className={`stat-trend-modern ${stat.trendType}`}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {stat.trendType === "positive" ? (
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  ) : (
                    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                  )}
                </svg>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hide Quick Actions on mobile */}
      <div className="quick-actions-section desktop-only-section">
        <h2>QUICK ACTIONS</h2>
        <div className="actions-grid">
          <button className="action-btn primary">
            <Plus size={18} />
            New Shipment
          </button>
          <button className="action-btn secondary">
            <Printer size={18} />
            Print Labels
          </button>
          <button className="action-btn secondary">
            <UserPlus size={18} />
            Assign Driver
          </button>
          <button className="action-btn secondary">
            <MapPin size={18} />
            Track ID
          </button>
        </div>
      </div>

      <div className="shipments-section">
        <div className="shipments-header">
          <h2>Recent Shipments</h2>
          <a href="#" className="view-all-link">
            View All
          </a>
        </div>

        {isLoading ? (
          <div
            className="skeleton skeleton-card"
            style={{ height: "300px" }}
          ></div>
        ) : (
          <div className="shipments-container">
            {/* Desktop Table View */}
            <table className="shipments-desktop-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Destination</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>
                      <span className="shipment-id-link">{shipment.id}</span>
                    </td>
                    <td>{shipment.destination}</td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(shipment.status)}`}
                      >
                        {shipment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="shipments-mobile-list">
              {recentShipments.map((shipment) => (
                <div
                  key={`mob-${shipment.id}`}
                  className="mobile-shipment-card"
                >
                  <div className="mobile-icon-box">
                    {getTransportIcon(shipment.type)}
                  </div>
                  <div className="mobile-details">
                    <span className="mobile-id">{shipment.id}</span>
                    <div className="mobile-status-row">
                      <div
                        className={`mobile-status-dot ${getStatusBadgeClass(shipment.status)}`}
                      ></div>
                      {shipment.statusLabel} - {shipment.destination}
                    </div>
                  </div>
                  <button
                    className={`mobile-action ${getStatusBadgeClass(shipment.status)}`}
                  >
                    {shipment.status === "DELIVERED" ? (
                      <ShieldCheck size={18} />
                    ) : shipment.status === "IN-TRANSIT" &&
                      shipment.id === "#NVN-2109" ? (
                      <QrCode size={18} />
                    ) : (
                      <MoreHorizontal size={18} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isLoading && (
        <div className="active-fleet-card desktop-only-section">
          <div className="fleet-info">
            <div className="fleet-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="fleet-text">
              <h3>Active Fleet Routes</h3>
              <p>12 drivers currently active</p>
            </div>
          </div>
          <div className="avatar-stack">
            <div className="avatar">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
                alt="Driver"
              />
            </div>
            <div className="avatar">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede"
                alt="Driver"
              />
            </div>
            <div className="avatar">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=ffdfbf"
                alt="Driver"
              />
            </div>
            <div className="avatar more">+9</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
