import React from 'react';
import {
  LayoutGrid,
  ChevronDown,
  Box,
  ShieldCheck,
  Banknote,
  Plus,
  Cpu,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import RecentShipments from './RecentShipments/RecentShipments';
import ShipmentVolumeChart from '../../../components/dashboard/Charts/ShipmentVolumeChart/ShipmentVolumeChart';
import '../../dashboard/Dashboard.css';

const CompanyDashboard: React.FC = () => {
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
  ] as const;

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

      <div className="dashboard-left-col">
        <div className="stats-grid">
          {stats.map(stat => (
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
          <ShipmentVolumeChart />
        </div>

        <div className="content-section">
          <div className="section-title">
            <h2>
              <LayoutGrid size={18} />
              Recent Shipments
            </h2>
            <span className="view-all">View All</span>
          </div>
          <RecentShipments />
        </div>
      </div>

      <div className="right-rail">
        <div className="rail-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-list">
            <button className="action-button primary" type="button">
              <span className="action-label">Create New Shipment</span>
              <div className="action-icon">
                <Plus size={20} />
              </div>
            </button>
            <button className="action-button" type="button">
              <span className="action-label">Track Token Asset</span>
              <div className="action-icon">
                <LayoutGrid size={20} />
              </div>
            </button>
            <button className="action-button" type="button">
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
            <svg width="100%" height="100%" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default CompanyDashboard;

