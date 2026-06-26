import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Rocket,
  LayoutGrid,
  Truck,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { anomalyApi } from "@services/api/endpoints/anomalies";
import Avatar from "../../ui/Avatar";
import { useAuthContext } from "../../../context/AuthContext";

export interface SidebarProps {
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
  const { role } = useAuthContext();
  const [openAnomalyCount, setOpenAnomalyCount] = useState(0);

  useEffect(() => {
    anomalyApi.getAll({ status: "OPEN" }).then((result) => {
      setOpenAnomalyCount(result.data.length);
    }).catch(() => {
      // non-critical; badge just won't show
    });
  }, []);

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
      name: "Calendar",
      icon: <Calendar size={22} className="nav-icon-svg" />,
      path: "/dashboard/calendar",
    },
    {
      name: "Anomalies",
      icon: <AlertTriangle size={22} className="nav-icon-svg" />,
      path: "/dashboard/anomalies",
      badge: openAnomalyCount > 0 ? openAnomalyCount : undefined,
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
              <div className="nav-icon-wrapper" style={{ position: 'relative' }}>
                {item.icon}
                {'badge' in item && item.badge !== undefined && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9px] font-bold leading-none"
                    aria-label={`${item.badge} open anomalies`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
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

        <button
          className="avatar-btn"
          title="Profile"
          onClick={() => {
            navigate("/dashboard/profile");
            onClose();
          }}
        >
          <Avatar name={role ?? 'User'} size="sm" />
          {!isCollapsed && <span className="nav-label">Profile</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;