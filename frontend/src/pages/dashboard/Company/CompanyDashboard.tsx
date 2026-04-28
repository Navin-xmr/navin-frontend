import React, { useState, useEffect } from "react";
import {
  Box, Clock, CheckCircle2, Truck, Plus, Printer, UserPlus, MapPin,
  MoreHorizontal, Ship, Plane, Train, ShieldCheck, AlertTriangle,
  Rocket, Menu, QrCode,
} from "lucide-react";

const badgeClasses: Record<string, string> = {
  "delivered":  "bg-[rgba(16,185,129,0.1)]  text-[#10b981] border border-[rgba(16,185,129,0.2)]",
  "in-transit": "bg-[rgba(59,130,246,0.1)]  text-[#3b82f6] border border-[rgba(59,130,246,0.2)]",
  "delayed":    "bg-[rgba(245,158,11,0.1)]  text-[#f59e0b] border border-[rgba(245,158,11,0.2)]",
  "pending":    "bg-[rgba(148,163,184,0.1)] text-[#94a3b8] border border-[rgba(148,163,184,0.2)]",
};

const dotClasses: Record<string, string> = {
  "delivered":  "bg-[#10b981]",
  "in-transit": "bg-[#3b82f6]",
  "delayed":    "bg-[#f59e0b]",
  "pending":    "bg-[#64748b]",
};

const mobileActionClasses: Record<string, string> = {
  "delivered":  "border-[rgba(16,185,129,0.4)]  text-[#10b981] bg-[rgba(16,185,129,0.1)]",
  "in-transit": "border-[rgba(59,130,246,0.4)]  text-[#3b82f6] bg-[rgba(59,130,246,0.1)]",
  "delayed":    "border-[rgba(249,115,22,0.4)]  text-[#f97316] bg-[rgba(249,115,22,0.1)]",
  "pending":    "border-[rgba(30,41,59,0.8)]    text-[#64748b] bg-[rgba(255,255,255,0.04)]",
};

const getStatusKey = (status: string) => {
  switch (status) {
    case "DELIVERED":  return "delivered";
    case "IN-TRANSIT": return "in-transit";
    case "DELAYED":    return "delayed";
    default:           return "pending";
  }
};

const getTransportIcon = (type: string) => {
  switch (type) {
    case "ship":  return <Ship  size={20} strokeWidth={1.5} />;
    case "plane": return <Plane size={20} strokeWidth={1.5} />;
    case "train": return <Train size={20} strokeWidth={1.5} />;
    default:      return <Box   size={20} strokeWidth={1.5} />;
  }
};

const TrendIcon = ({ up }: { up: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {up
      ? <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      : <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />}
  </svg>
);

const stats = [
  { id: "active",    label: "Active",    value: "128",   trend: "12%", trendType: "positive", icon: <Truck       size={18} /> },
  { id: "delivered", label: "Delivered", value: "1,420", trend: "5%",  trendType: "positive", icon: <CheckCircle2 size={18} /> },
  { id: "delayed",   label: "Delayed",   value: "12",    trend: "2%",  trendType: "negative", icon: <Clock       size={18} /> },
  { id: "verified",  label: "Verified",  value: "45",    trend: "0%",  trendType: "neutral",  icon: <ShieldCheck size={18} /> },
];

const recentShipments = [
  { id: "#NVN-9842", destination: "40.7128° N",    status: "IN-TRANSIT", statusLabel: "In Transit", type: "box"   },
  { id: "#NVN-8711", destination: "Terminal B",    status: "DELIVERED",  statusLabel: "Delivered",  type: "train" },
  { id: "#NVN-4420", destination: "Customs Check", status: "DELAYED",    statusLabel: "Delayed",    type: "plane" },
  { id: "#NVN-2109", destination: "Pacific Route", status: "IN-TRANSIT", statusLabel: "On Vessel",  type: "ship"  },
];

const CompanyDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsLoading(false);
      } catch {
        setHasError(true);
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (hasError) {
    return (
      <div className="w-full max-w-[1080px] mx-auto px-[46px] py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-[#14171e] border border-dashed border-[#ef4444] rounded-xl text-center">
          <AlertTriangle size={48} className="text-[#ef4444] mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-[#94a3b8] text-sm mb-4">There was a problem connecting to the logistics network.</p>
          <button className="bg-[#ef4444] text-white border-none px-4 py-2 rounded-md font-medium cursor-pointer" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-white bg-transparent w-full max-w-[1080px] mx-auto min-h-[calc(100vh-72px)] px-[46px] py-6 flex flex-col gap-8 max-md:px-4 max-md:gap-6 max-md:pb-[90px]">

      {/* Mobile branded header */}
      <div className="hidden max-md:flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#3b82f6] rounded-[10px] flex items-center justify-center">
            <Rocket size={16} color="#fff" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-widest">NAVIN</span>
        </div>
        <button className="bg-transparent border-none cursor-pointer p-1 flex items-center" aria-label="Menu">
          <Menu size={22} color="#fff" />
        </button>
      </div>

      {/* Title */}
      <div className="flex justify-between items-end max-md:flex-col max-md:items-start max-md:gap-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight m-0 mb-1 max-md:text-[22px] max-md:font-bold">Logistics Overview</h1>
          <p className="text-[#94a3b8] text-sm m-0">Blockchain-synced real-time data</p>
        </div>
        <div className="max-md:hidden flex items-center gap-1.5 bg-[#14171e] border border-[#1e293b] px-3 py-1.5 rounded-md text-xs font-medium text-[#94a3b8]">
          Live: <span className="text-[#10b981]">Connected</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 max-md:gap-3">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <div key={i} className="h-[120px] rounded-xl animate-shimmer" />)
          : stats.map((stat) => (
            <div key={stat.id} className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6 flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#334155] max-md:p-4">
              <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-semibold uppercase tracking-[0.05em] mb-4">
                {stat.icon}{stat.label}
              </div>
              <div className={`text-[32px] font-semibold mb-2 max-md:text-[28px] ${stat.id === "delayed" ? "text-[#f59e0b]" : "text-white"}`}>
                {stat.value}
              </div>
              <div className={`text-[13px] font-medium flex items-center gap-1 ${
                stat.trendType === "positive" ? "text-[#10b981]" :
                stat.trendType === "negative" ? "text-[#ef4444]" : "text-[#94a3b8]"
              }`}>
                <TrendIcon up={stat.trendType === "positive"} />{stat.trend}
              </div>
            </div>
          ))
        }
      </div>

      {/* Quick Actions — desktop only */}
      <div className="max-md:hidden">
        <h2 className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.05em] m-0 mb-4">QUICK ACTIONS</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center gap-2 px-4 h-[50px] rounded-lg text-sm font-medium cursor-pointer bg-[#4f46e5] text-white border-transparent transition-colors hover:bg-[#4338ca]">
            <Plus size={18} /> New Shipment
          </button>
          {[
            { icon: <Printer size={18} />, label: "Print Labels" },
            { icon: <UserPlus size={18} />, label: "Assign Driver" },
            { icon: <MapPin size={18} />, label: "Track ID" },
          ].map(({ icon, label }) => (
            <button key={label} className="flex items-center gap-2 px-4 h-[50px] rounded-lg text-sm font-medium cursor-pointer bg-[#14171e] border border-[#1e293b] text-white transition-colors hover:bg-[#1e2433] hover:border-[#334155]">
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.05em] m-0 max-md:text-lg max-md:font-bold max-md:text-white max-md:normal-case max-md:tracking-normal">
            Recent Shipments
          </h2>
          <a href="#" className="text-[13px] font-medium text-[#94a3b8] no-underline transition-colors hover:text-white max-md:text-[#3b82f6] max-md:font-semibold">
            View All
          </a>
        </div>

        {isLoading ? (
          <div className="h-[300px] rounded-xl animate-shimmer" />
        ) : (
          <div className="border border-[rgba(30,41,59,0.5)] rounded-xl overflow-hidden max-md:bg-transparent max-md:border-none">
            {/* Desktop table */}
            <table className="w-full border-collapse max-md:hidden">
              <thead>
                <tr>
                  {["ID", "Destination", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-[13px] font-medium text-[#64748b] border-b border-[rgba(30,41,59,0.5)] bg-[rgba(15,23,42,0.5)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((s) => (
                  <tr key={s.id} className="group">
                    <td className="px-6 py-4 text-sm border-b border-[rgba(30,41,59,0.5)] bg-[#131720] group-hover:bg-[rgba(255,255,255,0.02)]">
                      <span className="text-[#94a3b8] font-mono text-[13px]">{s.id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white border-b border-[rgba(30,41,59,0.5)] bg-[#131720] group-hover:bg-[rgba(255,255,255,0.02)]">{s.destination}</td>
                    <td className="px-6 py-4 text-sm border-b border-[rgba(30,41,59,0.5)] bg-[#131720] group-hover:bg-[rgba(255,255,255,0.02)]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-[0.05em] ${badgeClasses[getStatusKey(s.status)]}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="hidden max-md:flex flex-col">
              {recentShipments.map((s) => {
                const key = getStatusKey(s.status);
                const isQr = s.status === "IN-TRANSIT" && s.id === "#NVN-2109";
                return (
                  <div key={`mob-${s.id}`} className="flex items-center bg-[#131720] rounded-xl mb-2 border border-[rgba(30,41,59,0.5)] px-4 py-3.5 gap-3">
                    <div className="w-10 h-10 min-w-[40px] bg-[rgba(255,255,255,0.04)] rounded-[10px] flex items-center justify-center text-[#94a3b8]">
                      {getTransportIcon(s.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-[15px] text-white whitespace-nowrap overflow-hidden text-ellipsis">{s.id}</span>
                      <div className="flex items-center gap-1.5 text-[13px] text-[#94a3b8] mt-0.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClasses[key]}`} />
                        {s.statusLabel} - {s.destination}
                      </div>
                    </div>
                    <button className={`min-w-[36px] w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer flex-shrink-0 ${isQr ? "!w-11 !h-11 bg-[#3b82f6] text-white border-[#3b82f6]" : mobileActionClasses[key]}`}>
                      {s.status === "DELIVERED" ? <ShieldCheck size={18} /> : isQr ? <QrCode size={18} /> : <MoreHorizontal size={18} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Fleet — desktop only */}
      {!isLoading && (
        <div className="max-md:hidden bg-[#14171e] border border-[#1e293b] rounded-xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[rgba(79,70,229,0.1)] text-[#4f46e5] rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="m-0 mb-0.5 text-sm font-semibold">Active Fleet Routes</h3>
              <p className="m-0 text-xs text-[#94a3b8]">12 drivers currently active</p>
            </div>
          </div>
          <div className="flex items-center">
            {[
              { seed: "Felix", bg: "b6e3f4" },
              { seed: "Aneka", bg: "c0aede" },
              { seed: "Jack",  bg: "ffdfbf" },
            ].map((a, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#14171e] -ml-2 first:ml-0 bg-[#334155] overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.seed}&backgroundColor=${a.bg}`} alt="Driver" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-[#14171e] -ml-2 bg-[#334155] flex items-center justify-center text-[11px] font-semibold text-white">
              +9
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
