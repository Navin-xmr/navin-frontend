import React from "react";
import { Menu, Search, Bell } from "lucide-react";
import "./TopHeader.css";

interface TopHeaderProps {
  toggleSidebar: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ toggleSidebar }) => {
  // The useState, useRef, and useEffect related to the user dropdown are removed
  // as the profile section is stripped out.

  return (
    <div className="top-header-wrapper">
      <header className="top-header">
        <div className="top-header-left">
          <button
            className="mobile-toggle icon-box"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="top-header-center">
          <label className="header-search">
            <Search size={16} className="header-search-icon" />
            <input
              type="text"
              className="header-search-input"
              placeholder="Search shipment ID..."
            />
          </label>
        </div>

        <div className="top-header-right">
          <div className="notification-bell-container">
            <Bell size={20} className="bell-icon" />
            <div className="notification-dot"></div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default TopHeader;
