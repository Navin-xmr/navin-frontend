import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LayoutGrid, User, Settings as SettingsIcon, LogOut, Search } from 'lucide-react';
import './TopHeader.css';

interface TopHeaderProps {
  toggleSidebar: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="top-header">
      <div className="top-header-left">
        <button className="mobile-toggle icon-box" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={18} />
        </button>
        <div className="title-container">
          <label className="header-search" aria-label="Search">
            <Search size={16} className="header-search-icon" />
            <input
              type="text"
              className="header-search-input"
              placeholder="Search shipments, wallet addresses, or harshes..."
            />
          </label>
        </div>
      </div>

      <div className="top-header-right">
        <div className="right-icons">
          <button className="icon-box" aria-label="Notifications">
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </button>
          
          <button className="icon-box" aria-label="Apps">
            <LayoutGrid size={18} />
          </button>
        </div>

        <div className="top-bar-divider"></div>

        <div className="user-profile-container" ref={dropdownRef}>
          <button 
            className="user-profile-trigger" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="user-text desktop-only">
              <span className="user-name">Alex Sterling</span>
              <span className="user-role">Logistics Manager</span>
            </div>
            <div className="avatar-wrapper">
              <img
                src="https://ui-avatars.com/api/?name=Alex+Sterling&background=ffedd5&color=9a3412"
                alt="Profile Avatar"
                className="user-avatar"
              />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="user-dropdown-menu">
              <ul className="dropdown-list">
                <li>
                  <button className="dropdown-item">
                    <User size={16} className="dropdown-icon" />
                    <span>Profile</span>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <SettingsIcon size={16} className="dropdown-icon" />
                    <span>Settings</span>
                  </button>
                </li>
                <li className="dropdown-divider"></li>
                <li>
                  <button className="dropdown-item text-danger">
                    <LogOut size={16} className="dropdown-icon" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
