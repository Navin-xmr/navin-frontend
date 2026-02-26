import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Truck, Map, User } from "lucide-react";
import "./DashboardLayout.css";
import TopHeader from "./TopHeader/TopHeader";
import Sidebar from "./Sidebar/Sidebar";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`dashboard-page ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        onClose={closeSidebar}
        toggleCollapse={toggleCollapse}
      />

      {/* Main Content */}
      <div className={`main-wrapper ${isCollapsed ? "collapsed" : ""}`}>
        <TopHeader toggleSidebar={toggleSidebar} />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation - persists across all dashboard routes */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-tab ${location.pathname === "/dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <LayoutGrid size={22} />
          <span>Dashboard</span>
        </button>
        <button
          className={`mobile-nav-tab ${location.pathname.includes("shipments") ? "active" : ""}`}
          onClick={() => navigate("/dashboard/shipments")}
        >
          <Truck size={22} />
          <span>Shipments</span>
        </button>
        <button
          className={`mobile-nav-tab ${location.pathname.includes("analytics") ? "active" : ""}`}
          onClick={() => navigate("/dashboard/analytics")}
        >
          <Map size={22} />
          <span>Live Map</span>
        </button>
        <button
          className={`mobile-nav-tab ${location.pathname.includes("settings") ? "active" : ""}`}
          onClick={() => navigate("/dashboard/settings")}
        >
          <User size={22} />
          <span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardLayout;
