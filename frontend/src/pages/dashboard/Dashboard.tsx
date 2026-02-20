import React from 'react';
import {
  LayoutGrid,
  ChevronDown,
  Box,
  ShieldCheck,
  Banknote,
  Plus,
  Link as LinkIcon,
  Cpu,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Total Shipments',
      value: '1,248',
      trend: '+4.2%',
      trendType: 'up',
      icon: <Box size={20} />,
    },
    {
      label: 'In Transit',
      value: '342',
      trend: 'Active',
      trendType: 'neutral',
      icon: <Cpu size={20} />,
    },
    {
      label: 'Delivered',
      value: '856',
      trend: '98% Goal',
      trendType: 'up',
      icon: <ShieldCheck size={20} />,
    },
    {
      label: 'Pending Payment',
      value: '$42.5k',
      trend: '-1.2%',
      trendType: 'down',
      icon: <Banknote size={20} />,
    },
  ];

  const shipments = [
    {
      id: '#SHP-9021',
      origin: 'Singapore',
      destination: 'Rotterdam',
      status: 'In Transit',
      hash: '0x4a9b...2f81',
    },
    {
      id: '#SHP-8842',
      origin: 'Hong Kong',
      destination: 'Los Angeles',
      status: 'Delivered',
      hash: '0x9c1a...9e55',
    },
    {
      id: '#SHP-8711',
      origin: 'Mumbai',
      destination: 'Dubai',
      status: 'Pending Approval',
      hash: 'Awaiting Mining...',
    },
  ];

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Logistics Overview</h1>
          <p>Real-time status of your global supply chain on the blockchain.</p>
        </div>
        <div className="date-selector">
          <Clock size={16} />
          <span>Last 30 Days</span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Left Column */}
      <div className="dashboard-left-col">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">{stat.icon}</div>
                <div className={`stat-trend trend-${stat.trendType}`}>
                  {stat.trendType === 'up' && <ArrowUpRight size={14} />}
                  {stat.trendType === 'down' && <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="content-section">
          <div className="section-title">
            <h2>
              <LayoutGrid size={18} />
              Recent Shipments
            </h2>
            <span className="view-all">View All</span>
          </div>
          <table className="shipments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Origin / Destination</th>
                <th>Status</th>
                <th>Blockchain Hash</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="shipment-id-cell">{shipment.id}</td>
                  <td>
                    <div className="location-cell">
                      <span className="location-label">From: {shipment.origin}</span>
                      <span className="location-sublabel">To: {shipment.destination}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${shipment.status
                        .toLowerCase()
                        .replace(' ', '-')}`}
                    >
                      {shipment.status}
                    </span>
                  </td>
                  <td className="hash-cell">
                    <LinkIcon size={12} />
                    {shipment.hash}
                  </td>
                  <td>
                    <button className="verify-button">Verify</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column (Rail) */}
      <div className="right-rail">
        <div className="rail-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-list">
            <button className="action-button primary">
              <span className="action-label">Create New Shipment</span>
              <div className="action-icon">
                <Plus size={20} />
              </div>
            </button>
            <button className="action-button">
              <span className="action-label">Track Token Asset</span>
              <div className="action-icon">
                <LayoutGrid size={20} />
              </div>
            </button>
            <button className="action-button">
              <span className="action-label">Generate Settlement</span>
              <div className="action-icon">
                <Banknote size={20} />
              </div>
            </button>
          </div>
        </div>

        <div className="rail-card">
          <div className="distribution-header">
            <h3>Network Distribution</h3>
          </div>
          <div className="map-placeholder">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 30 Q 25 10, 40 30 T 70 30 T 90 20"
                stroke="#1e2433"
                strokeWidth="0.5"
                fill="none"
              />
              <circle cx="20" cy="25" r="1.5" fill="#3b82f6" />
              <circle cx="45" cy="35" r="1.5" fill="#10b981" />
              <circle cx="75" cy="20" r="1.5" fill="#3b82f6" />
              <circle cx="85" cy="40" r="1.5" fill="#3b82f6" />
            </svg>
          </div>
          <div className="distribution-stats">
            <div className="dist-stat-item">
              <span className="dist-stat-label">Active Nodes</span>
              <span className="dist-stat-value">142</span>
            </div>
            <div className="dist-stat-item">
              <span className="dist-stat-label">TPS</span>
              <span className="dist-stat-value">2,140</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
