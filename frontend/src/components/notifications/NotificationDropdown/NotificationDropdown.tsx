import React, { useState, useRef, useEffect } from "react";
import { Bell, Package, DollarSign, AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./NotificationDropdown.css";

interface Notification {
  id: string;
  type: "shipment" | "payment" | "alert";
  message: string;
  timestamp: Date;
  read: boolean;
}

// Mock data - moved outside component to avoid impure function calls during render
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "shipment",
    message: "Shipment #SH-2024-001 has been delivered successfully",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
  },
  {
    id: "2",
    type: "payment",
    message: "Payment of 5,000 XLM received for shipment #SH-2024-002",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: false,
  },
  {
    id: "3",
    type: "alert",
    message: "Shipment #SH-2024-003 is delayed due to weather conditions",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: false,
  },
  {
    id: "4",
    type: "shipment",
    message:
      "New shipment #SH-2024-004 has been created and is awaiting pickup",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
  },
  {
    id: "5",
    type: "payment",
    message: "Settlement completed for 3 shipments totaling 15,000 XLM",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
  },
];

const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "shipment":
        return <Package size={16} className="notification-icon shipment" />;
      case "payment":
        return <DollarSign size={16} className="notification-icon payment" />;
      case "alert":
        return <AlertTriangle size={16} className="notification-icon alert" />;
      default:
        return <Bell size={16} className="notification-icon" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    // Navigate to notifications page (to be implemented)
    console.log("Navigate to all notifications");
    navigate("/dashboard/notifications");
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button
        className="icon-box notification-bell"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3 className="notification-dropdown-title">Notifications</h3>
            <button
              className="notification-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>

          <div className="notification-list">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? "unread" : ""}`}
              >
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {getTimeAgo(notification.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="notification-dropdown-footer">
            <button className="view-all-btn" onClick={handleViewAll}>
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
