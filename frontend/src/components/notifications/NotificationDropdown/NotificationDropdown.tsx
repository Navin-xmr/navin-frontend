import React, { useState, useRef, useEffect } from "react";
import { Bell, Package, DollarSign, AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface NotificationItem {
  id: string;
  type: "shipment" | "payment" | "alert";
  message: string;
  timestamp: Date;
  read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "1", type: "shipment", message: "Shipment #SH-2024-001 has been delivered successfully", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: false },
  { id: "2", type: "payment", message: "Payment of 5,000 XLM received for shipment #SH-2024-002", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), read: false },
  { id: "3", type: "alert", message: "Shipment #SH-2024-003 is delayed due to weather conditions", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), read: false },
  { id: "4", type: "shipment", message: "New shipment #SH-2024-004 has been created and is awaiting pickup", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), read: true },
  { id: "5", type: "payment", message: "Settlement completed for 3 shipments totaling 15,000 XLM", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), read: true },
];

const getTimeAgo = (timestamp: Date, now: number): string => {
  const diffMs = now - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [now] = useState(() => Date.now());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    const base = "shrink-0";
    switch (type) {
      case "shipment": return <Package size={16} className={`${base} text-blue-500`} />;
      case "payment":  return <DollarSign size={16} className={`${base} text-emerald-500`} />;
      case "alert":    return <AlertTriangle size={16} className={`${base} text-amber-500`} />;
      default:         return <Bell size={16} className={`${base} text-slate-400`} />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative flex items-center justify-center w-[34px] h-[34px] rounded-lg bg-[#07090d] text-white border-none cursor-pointer transition-all hover:bg-[#1e2433]"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span aria-live="polite" aria-atomic="true" className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold border-2 border-[#07090d]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] right-0 w-[380px] max-h-[480px] bg-[#0f121a] border border-[#1e2433] rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] z-50 flex flex-col animate-slide-down max-md:w-[320px] max-md:right-[-16px]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2433] max-md:px-4 max-md:py-3.5">
            <h3 className="text-base font-semibold text-white m-0">Notifications</h3>
            <button
              className="flex items-center justify-center w-6 h-6 bg-transparent border-none text-slate-400 cursor-pointer rounded hover:bg-[#1a1f2e] hover:text-white transition-all"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div role="list" className="overflow-y-auto max-h-[360px] py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1e2433] [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb:hover]:bg-[#334155]">
            {notifications.slice(0, 5).map((n) => (
              <div
                role="listitem"
                key={n.id}
                className={`flex gap-3 px-5 py-3 cursor-pointer transition-colors border-l-[3px] hover:bg-[#1a1f2e] max-md:px-4 max-md:py-2.5 ${
                  !n.read
                    ? "bg-blue-500/5 border-l-blue-500"
                    : "border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-center shrink-0 w-8 h-8 rounded-lg bg-[#1e2433] p-2">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-[13px] text-slate-200 leading-[1.4] m-0 overflow-hidden text-ellipsis [-webkit-line-clamp:1] [-webkit-box-orient:vertical] [display:-webkit-box]">
                    {n.message}
                  </p>
                  <span className="text-[11px] text-slate-500">{getTimeAgo(n.timestamp, now)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[#1e2433] max-md:px-4 max-md:py-2.5">
            <button
              className="w-full py-2.5 bg-transparent border-none text-blue-500 text-[13px] font-semibold cursor-pointer rounded-md transition-all text-center hover:bg-blue-500/10 hover:text-blue-400"
              onClick={() => { setIsOpen(false); navigate("/dashboard/notifications"); }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;