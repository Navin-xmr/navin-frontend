import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, User } from "lucide-react";
import { NotificationDropdown } from "../../notifications/NotificationDropdown/NotificationDropdown";

export interface TopHeaderProps {
  toggleSidebar: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-20 w-full bg-[#14171e]">
      <header className="w-full max-w-270 mx-auto h-18 flex flex-row items-center justify-between px-4 bg-transparent border-b border-slate-800">
        {/* Left */}
        <div className="flex items-center w-50">
          <button
            className="lg:hidden flex items-center justify-center bg-transparent border-none text-white cursor-pointer"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Center */}
        <div className="flex-1 flex justify-center">
          <label className="flex items-center gap-3 w-120 max-w-full h-10 px-4 rounded-[10px] bg-[#111624] border border-slate-800 transition-colors focus-within:border-indigo-500 cursor-text">
            <Search size={16} className="text-slate-500 shrink-0" />
            <input
              type="text"
              className="w-full border-none outline-none bg-transparent text-white text-sm placeholder:text-slate-500"
              placeholder="Search shipment ID..."
            />
          </label>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-3 w-50">
          <NotificationDropdown />
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="w-9 h-9 rounded-full bg-[#1e2433] border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#62ffff] transition-colors cursor-pointer"
            title="Profile"
          >
            <User size={18} />
          </button>
        </div>
      </header>
    </div>
  );
};

export default TopHeader;