import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, User } from "lucide-react";
import { NotificationDropdown } from "../../notifications/NotificationDropdown/NotificationDropdown";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import ConnectionStatusDot from "../../ui/ConnectionStatusDot";
import { realtimeService, type ConnectionStatus } from "../../../services/realtime/realtimeService";
import WalletPill from "../../wallet/WalletPill";
import NetworkBadge from "../../wallet/NetworkBadge";
import WalletModal from "../../wallet/WalletModal";
import Tooltip from "../../ui/Tooltip";

export interface TopHeaderProps {
  toggleSidebar: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [connStatus, setConnStatus] = useState<ConnectionStatus>(realtimeService.status);

  useEffect(() => {
    const unsub = realtimeService.onStatusChange(setConnStatus);
    return unsub;
  }, []);

  return (
    <div className="sticky top-0 z-20 w-full bg-white dark:bg-[#14171e]">
      <header className="w-full max-w-270 mx-auto h-18 flex flex-row items-center justify-between px-4 bg-transparent border-b border-gray-200 dark:border-slate-800">
        {/* Left */}
        <div className="flex items-center w-50">
          <Tooltip content="Toggle sidebar" placement="bottom">
            <button
              className="lg:hidden flex items-center justify-center bg-transparent border-none text-white cursor-pointer"
              onClick={toggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
          </Tooltip>
        </div>

        {/* Center */}
        <div className="flex-1 flex justify-center">
          <label className="flex items-center gap-3 w-120 max-w-full h-10 px-4 rounded-[10px] bg-gray-100 dark:bg-[#111624] border border-gray-200 dark:border-slate-800 transition-colors focus-within:border-indigo-500 cursor-text">
            <Search size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              className="w-full border-none outline-none bg-transparent text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500"
              placeholder="Search shipment ID..."
              aria-label="Search shipment ID"
            />
          </label>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-3 w-auto">
          <ConnectionStatusDot status={connStatus} />
          <NetworkBadge />
          <WalletPill />
          <ThemeToggle />
          <NotificationDropdown />
          <Tooltip content="View profile" placement="bottom">
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1e2433] border border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:border-teal-500 dark:hover:border-[#62ffff] transition-colors cursor-pointer"
              aria-label="View profile"
            >
              <User size={18} />
            </button>
          </Tooltip>
          <WalletModal />
        </div>
      </header>
    </div>
  );
};

export default TopHeader;
