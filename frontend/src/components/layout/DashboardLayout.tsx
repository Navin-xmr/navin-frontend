import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Database,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
  ShieldCheck,
  Cpu,
  X,
} from 'lucide-react';
import './DashboardLayout.css';
import TopHeader from './TopHeader/TopHeader';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mainMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Shipments', icon: <Package size={18} />, path: '/dashboard/shipments' },
    { name: 'Blockchain Ledger', icon: <Database size={18} />, path: '/dashboard/blockchain-ledger' },
    { name: 'Settlements', icon: <Wallet size={18} />, path: '/dashboard/settlements' },
    { name: 'Analytics', icon: <BarChart3 size={18} />, path: '/dashboard/analytics' },
  ];

  const systemMenu = [
    { name: 'Settings', icon: <Settings size={18} />, path: '/dashboard/settings' },
    { name: 'Help Center', icon: <HelpCircle size={18} />, path: '/dashboard/help-center' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`dashboard-page ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="mobile-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Cpu fill="currentColor" size={24} />
          <span>NAVIN</span>
          <button className="mobile-close" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section">
          <h3>Main Menu</h3>
          <div className="sidebar-menu">
            {mainMenu.map((item) => (
              <button
                key={item.name}
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  closeSidebar();
                }}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <h3>System</h3>
          <div className="sidebar-menu">
            {systemMenu.map((item) => (
              <button
                key={item.name}
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  closeSidebar();
                }}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="node-status">
            <div className="node-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="node-info">
              <h4>Enterprise Node</h4>
              <p>
                <span className="status-dot"></span>
                Syncing: Block 18.2M
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <TopHeader toggleSidebar={toggleSidebar} />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
