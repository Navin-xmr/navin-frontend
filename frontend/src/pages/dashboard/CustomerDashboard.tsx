import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  Filter,
  House,
  LayoutDashboard,
  MapPinned,
  Menu,
  Package,
  PackageCheck,
  PackageSearch,
  Search,
  Settings,
  Truck,
  UserRound,
} from 'lucide-react';
import './CustomerDashboard.css';

type ShipmentStatus = 'in-transit' | 'delayed' | 'delivered';

interface Shipment {
  id: string;
  customer: string;
  route: string;
  etaLabel: string;
  progress: number;
  status: ShipmentStatus;
  amount: string;
  reason?: string;
}

const shipments: Shipment[] = [
  {
    id: 'SHP-20491',
    customer: 'Eko Retail Hub',
    route: 'Abuja -> Enugu',
    etaLabel: 'Today, 18:40',
    progress: 78,
    status: 'in-transit',
    amount: 'N4,900,000',
  },
  {
    id: 'SHP-19302',
    customer: 'Northline Pharma',
    route: 'Kano -> Ibadan',
    etaLabel: 'Expected tomorrow, 09:15',
    progress: 43,
    status: 'delayed',
    reason: '+8h due to weather',
    amount: 'N2,120,000',
  },
  {
    id: 'SHP-18870',
    customer: 'Coastal Foods',
    route: 'Port Harcourt -> Lagos',
    etaLabel: 'Delivered 14:12',
    progress: 100,
    status: 'delivered',
    amount: 'N1,680,000',
  },
];

const linePoints = [44, 58, 52, 71, 68, 79, 92];
const barSeries = [
  { label: 'LA', value: 42 },
  { label: 'ABJ', value: 64 },
  { label: 'KN', value: 33 },
  { label: 'PH', value: 52 },
  { label: 'ENU', value: 40 },
];

const statusConfig: Record<
  ShipmentStatus,
  {
    label: string;
    icon: React.ReactNode;
    description: (shipment: Shipment) => string;
    actions: [string, string];
  }
> = {
  'in-transit': {
    label: 'In Transit',
    icon: <Truck size={14} />,
    description: (shipment) => `ETA ${shipment.etaLabel}`,
    actions: ['Track Live', 'Contact'],
  },
  delayed: {
    label: 'Delayed',
    icon: <CircleAlert size={14} />,
    description: (shipment) => shipment.reason || 'Delay reported',
    actions: ['Resolve', 'Notify'],
  },
  delivered: {
    label: 'Delivered',
    icon: <CircleCheckBig size={14} />,
    description: (shipment) => shipment.etaLabel,
    actions: ['View Receipt', 'Reorder'],
  },
};

const sidebarItems = [
  { label: 'Dashboard', icon: <LayoutDashboard size={16} />, active: true },
  { label: 'Shipments', icon: <PackageSearch size={16} /> },
  { label: 'Fleet', icon: <Truck size={16} /> },
  { label: 'Analytics', icon: <BarChart3 size={16} /> },
  { label: 'Settings', icon: <Settings size={16} /> },
];

const CustomerDashboard: React.FC = () => {
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  const [activeMobileNav, setActiveMobileNav] = useState('Shipments');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(shipments[0]?.id ?? null);

  return (
    <div className="customer-dashboard-page">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <MapPinned size={18} />
            <span>Navin</span>
          </div>
          <p className="sidebar-version">Neon ops panel</p>

          <nav className="sidebar-nav" aria-label="Primary">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveSidebar(item.label)}
                className={activeSidebar === item.label ? 'sidebar-item active' : 'sidebar-item'}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-promo">
            <p>Enable predictive dispatch and route-level anomaly alerts.</p>
            <button type="button">Activate AI Routing</button>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="dashboard-brand">
              <button className="icon-btn mobile-only" aria-label="Open navigation">
                <Menu size={18} />
              </button>
              <div>
                <h1>Hello Thomas,</h1>
                <p>Real-time command center for active customer shipments.</p>
              </div>
            </div>
            <div className="topbar-actions">
              <button className="icon-btn" aria-label="Notifications">
                <Bell size={18} />
              </button>
              <button className="icon-btn" aria-label="Profile">
                <UserRound size={18} />
              </button>
            </div>
          </header>

          <section className="notification-banner" role="status" aria-live="polite">
            <CircleAlert size={16} />
            <p>2 shipments delayed due to weather in the Lagos corridor.</p>
            <button type="button">View details</button>
          </section>

          <section className="dashboard-controls">
            <div className="search-input-wrap">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search by shipment ID, route, or customer"
                aria-label="Search shipments"
              />
            </div>
            <select aria-label="Filter by status">
              <option>All Statuses</option>
              <option>In Transit</option>
              <option>Delayed</option>
              <option>Delivered</option>
            </select>
            <select aria-label="Filter by date">
              <option>Any Date</option>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
            <button className="filter-btn" type="button">
              <Filter size={16} /> More Filters
            </button>
          </section>

          <section className="analytics-grid">
            <article className="chart-card">
              <div className="chart-header">
                <h3>Delivery Performance</h3>
                <span>Last 7 days</span>
              </div>
              <svg className="line-chart" viewBox="0 0 360 160" role="img" aria-label="Delivery trend line chart">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00D1FF" />
                    <stop offset="100%" stopColor="#59F7D2" />
                  </linearGradient>
                </defs>
                <polyline
                  className="line-chart-path"
                  points={linePoints
                    .map((value, index) => `${20 + index * 52},${145 - (value / 100) * 120}`)
                    .join(' ')}
                />
                {linePoints.map((value, index) => (
                  <circle
                    key={`${value}-${index}`}
                    cx={20 + index * 52}
                    cy={145 - (value / 100) * 120}
                    r={4}
                    fill="#00D1FF"
                  />
                ))}
              </svg>
            </article>

            <article className="chart-card">
              <div className="chart-header">
                <h3>Shipment Volume</h3>
                <span>By route zone</span>
              </div>
              <div className="bar-chart" role="img" aria-label="Shipment volume bar chart">
                {barSeries.map((bar) => (
                  <div key={bar.label} className="bar-item">
                    <span className="bar-value">{bar.value}</span>
                    <div className="bar-track">
                      <span style={{ height: `${bar.value}%` }} />
                    </div>
                    <span className="bar-label">{bar.label}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="shipments-section">
            <div className="section-header">
              <h2>Active Shipments</h2>
              <p>State-aware cards for in transit, delayed, and delivered shipments.</p>
            </div>

            <div className="shipments-grid">
              {shipments.map((shipment) => {
                const current = statusConfig[shipment.status];
                return (
                  <article
                    key={shipment.id}
                    className={`shipment-card shipment-${shipment.status} ${
                      selectedShipmentId === shipment.id ? 'is-selected' : ''
                    }`}
                    aria-label={`${current.label} shipment ${shipment.id}`}
                    onClick={() => setSelectedShipmentId(shipment.id)}
                  >
                    <div className="shipment-card-header">
                      <span className={`status-chip chip-${shipment.status}`}>
                        {current.icon}
                        {current.label}
                      </span>
                      <span className="shipment-id">{shipment.id}</span>
                    </div>

                    <p className="shipment-route">{shipment.route}</p>
                    <p className="shipment-customer">{shipment.customer}</p>
                    <p className="shipment-description">{current.description(shipment)}</p>

                    <div className="progress-track" aria-hidden="true">
                      <span style={{ width: `${shipment.progress}%` }} />
                    </div>
                    <div className="shipment-foot">
                      <p className="progress-label">{shipment.progress}% complete</p>
                      <p className="shipment-amount">{shipment.amount}</p>
                    </div>

                    <div className="card-actions">
                      <button type="button">{current.actions[0]}</button>
                      <button type="button" className="secondary">
                        {current.actions[1]}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="dashboard-right-rail">
          <div className="metric-card">
            <p>Weekly Shipments</p>
            <h3>278</h3>
            <span>+16.2% vs last week</span>
          </div>
          <div className="metric-card">
            <p>Average Order Value</p>
            <h3>N182,700</h3>
            <span>-3.6% this week</span>
          </div>
          <div className="metric-card">
            <p>Delivered Today</p>
            <h3>42</h3>
            <span>92% on-time completion</span>
          </div>
          <div className="timeline-panel">
            <div className="timeline-header">
              <h3>Dispatch Timeline</h3>
              <span>Today</span>
            </div>
            <div className="timeline-items">
              <p>
                <Clock3 size={14} /> 09:30 - SHP-20491 reached Lokoja checkpoint.
              </p>
              <p>
                <Clock3 size={14} /> 11:15 - Delay notice logged for SHP-19302.
              </p>
              <p>
                <Clock3 size={14} /> 14:12 - SHP-18870 delivered and confirmed.
              </p>
            </div>
          </div>
          <div className="action-card">
            <h4>Create quick shipment</h4>
            <p>Save sender, route, and package presets for faster booking.</p>
            <button type="button">
              <PackageCheck size={14} /> New Shipment
            </button>
          </div>
        </aside>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button
          type="button"
          onClick={() => setActiveMobileNav('Home')}
          className={activeMobileNav === 'Home' ? 'active' : ''}
        >
          <House size={16} />
          Home
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileNav('Shipments')}
          className={activeMobileNav === 'Shipments' ? 'active' : ''}
        >
          <Package size={16} />
          Shipments
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileNav('Alerts')}
          className={activeMobileNav === 'Alerts' ? 'active' : ''}
        >
          <Bell size={16} />
          Alerts
        </button>
      </nav>
    </div>
  );
};

export default CustomerDashboard;
