import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Rocket,
  LayoutGrid,
  Truck,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
} from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  toggleCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainNav = [
    {
      name: "Dashboard",
      icon: <LayoutGrid size={22} className="nav-icon-svg" />,
      path: "/dashboard",
    },
    {
      name: "Shipments",
      icon: <Truck size={22} className="nav-icon-svg" />,
      path: "/dashboard/shipments",
    },
    {
      name: "Team",
      icon: <Users size={22} className="nav-icon-svg" />,
      path: "/dashboard/team",
    },
    {
      name: "Analytics",
      icon: <BarChart2 size={22} className="nav-icon-svg" />,
      path: "/dashboard/analytics",
    },
    {
      name: "Settings",
      icon: <Settings size={22} className="nav-icon-svg" />,
      path: "/dashboard/settings",
    },
  ];

  return (
    <aside
      className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
    >
      <div className="sidebar-header">
        <div
          className="logo-btn"
          onClick={toggleCollapse}
          title="Toggle Sidebar"
        >
          <div className="rocket-box">
            <Rocket size={20} color="#ffffff" strokeWidth={2.5} />
          </div>
          {!isCollapsed && <span className="logo-text">Navin</span>}
        </div>
      </div>

      <nav className="sidebar-nav primary-nav">
        {mainNav.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname === "/");
          return (
            <button
              key={item.name}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              title={item.name}
            >
              <div className="nav-icon-wrapper">{item.icon}</div>
              {!isCollapsed && <span className="nav-label">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          className="nav-item help-btn"
          onClick={() => {
            navigate("/help");
            onClose();
          }}
          title="Help Center"
        >
          <div className="nav-icon-wrapper">
            <HelpCircle size={22} className="nav-icon-svg" />
          </div>
          {!isCollapsed && <span className="nav-label">Help Center</span>}
        </button>

        <button className="avatar-btn" title="Profile">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=ffcba4"
            alt="User Profile"
            className="user-avatar-img"
          />
          {!isCollapsed && <span className="nav-label">Profile</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
