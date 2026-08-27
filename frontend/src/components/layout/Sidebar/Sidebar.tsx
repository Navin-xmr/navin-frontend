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
  Sparkles,
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
      icon: <LayoutGrid size={22} />,
      path: "/dashboard",
    },
    {
      name: "Shipments",
      icon: <Truck size={22} />,
      path: "/dashboard/shipments",
    },
    {
      name: "Calendar",
      icon: <Calendar size={22} />,
      path: "/dashboard/calendar",
    },
    {
      name: "Anomalies",
      icon: <AlertTriangle size={22} />,
      path: "/dashboard/anomalies",
      badge: openAnomalyCount > 0 ? openAnomalyCount : undefined,
    },
    {
      name: "Team",
      icon: <Users size={22} />,
      path: "/dashboard/team",
    },
    {
      name: "Analytics",
      icon: <BarChart2 size={22} />,
      path: "/dashboard/analytics",
    },
    {
      name: "Settings",
      icon: <Settings size={22} />,
      path: "/dashboard/settings",
    },
    {
      name: "What's New",
      icon: <Sparkles size={22} />,
      path: "/dashboard/whats-new",
    },
  ];

  return (
    <aside
      data-sidebar-open={isOpen}
      className={`hidden md:flex fixed top-0 left-0 bottom-0 z-50 flex-col bg-black/40 border-r border-slate-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`h-20 mt-4 flex items-center ${
          isCollapsed ? "justify-center" : "justify-start px-6"
        }`}
      >
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={toggleCollapse}
          title="Toggle Sidebar"
        >
          <div className="w-11 h-11 rounded-xl bg-[#3b82f6] shadow-[0_4px_12px_rgba(59,130,246,0.2)] flex items-center justify-center">
            <Rocket size={20} color="#ffffff" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <span className="text-white text-xl font-bold tracking-[-0.5px]">
              Navin
            </span>
          )}
        </div>
      </div>

      <nav className={`flex flex-col gap-4 py-6 ${isCollapsed ? "items-center" : "items-stretch px-6"}`}>
        {mainNav.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname === "/");
          return (
            <button
              key={item.name}
              className={`relative flex items-center h-10 rounded-lg border-none bg-transparent cursor-pointer text-slate-400 transition-all duration-200 hover:bg-white/[0.03]
                ${isCollapsed ? "w-[42px] justify-center p-0" : "w-full justify-start gap-3 px-4"}
                ${isActive ? "bg-white/[0.06] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-[30px] before:bg-[#3b82f6] before:rounded-r-[4px]" : ""}`}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              title={item.name}
            >
              <div className="relative flex items-center justify-center">
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
              {!isCollapsed && <span className="text-sm font-medium text-slate-300">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`mt-auto py-6 flex flex-col gap-8 ${isCollapsed ? "items-center" : "items-stretch px-6"}`}>
        <button
          className={`relative flex items-center h-10 rounded-lg border-none bg-transparent cursor-pointer text-slate-400 transition-all duration-200 hover:bg-white/[0.03] mb-auto
            ${isCollapsed ? "w-[42px] justify-center p-0" : "w-full justify-start gap-3 px-4"}`}
          onClick={() => {
            navigate("/help");
            onClose();
          }}
          title="Help Center"
        >
          <div className="flex items-center justify-center">
            <HelpCircle size={22} />
          </div>
          {!isCollapsed && <span className="text-sm font-medium text-slate-300">Help Center</span>}
        </button>

        <button
          className={`flex items-center rounded-full border-2 border-slate-800 bg-transparent p-0 cursor-pointer overflow-hidden transition-colors duration-200 hover:border-slate-500
            ${isCollapsed ? "w-[42px] h-[42px]" : "w-full rounded-xl gap-3 px-4 py-2"}`}
          title="Profile"
          onClick={() => {
            navigate("/dashboard/profile");
            onClose();
          }}
        >
          <Avatar name={role ?? 'User'} size="sm" />
          {!isCollapsed && <span className="text-sm font-medium text-slate-300">Profile</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;