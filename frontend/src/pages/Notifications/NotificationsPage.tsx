import "./NotificationsPage.css";
import {
  Bell,
  Settings,
  UserCircle,
  Search,
  Check,
  Truck,
  FileText,
  AlertTriangle,
  Server,
  Receipt,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

type NotificationType = "all" | "shipments" | "settlements" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  icon: "shipment" | "contract" | "alert" | "system" | "invoice" | "payment";
  title: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  timestamp: string;
  actionLabel?: string;
  isRead: boolean;
  link?: string;
}

const NotificationsPage = () => {
  const [activeFilter, setActiveFilter] = useState<NotificationType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [notificationsList, setNotificationsList] = useState<Notification[]>([
    {
      id: "1",
      type: "shipments",
      icon: "shipment",
      title: "Shipment Arrived at Port",
      badge: "SHIPMENT #NV-9920",
      badgeColor: "#137FEC",
      description:
        "The container has cleared customs in Singapore and is ready for last-mile delivery. All documents have been verified on-chain.",
      timestamp: "2 mins ago",
      actionLabel: "View Details",
      isRead: false,
      link: "/dashboard/shipments/NV-9920",
    },
    {
      id: "2",
      type: "settlements",
      icon: "contract",
      title: "Smart Contract Executed",
      badge: "USDC SETTLEMENT",
      badgeColor: "#4ADE80",
      description:
        "Payment of 500 USDC has been automatically released to Carrier A following successful delivery confirmation.",
      timestamp: "1 hour ago",
      actionLabel: "View Contract",
      isRead: false,
      link: "/dashboard/settlements",
    },
    {
      id: "3",
      type: "shipments",
      icon: "alert",
      title: "Documentation Required",
      badge: "ACTION NEEDED",
      badgeColor: "#FB923C",
      description:
        "Shipment #NV-8812 is missing the 'Bill of Lading' document. Upload immediately to prevent delays.",
      timestamp: "3 hours ago",
      actionLabel: "Upload",
      isRead: false,
      link: "/dashboard/shipments/NV-8812",
    },
    {
      id: "4",
      type: "settlements",
      icon: "payment",
      title: "Payment Received",
      badge: "PAYMENT #PAY-1024",
      badgeColor: "#4ADE80",
      description:
        "Payment of 1,200 USDC received from Client B for shipment #NV-9815.",
      timestamp: "5 hours ago",
      actionLabel: "View Details",
      isRead: false,
      link: "/dashboard/settlements",
    },
    {
      id: "5",
      type: "shipments",
      icon: "shipment",
      title: "Shipment In Transit",
      badge: "SHIPMENT #NV-9921",
      badgeColor: "#137FEC",
      description:
        "Your shipment is currently in transit and expected to arrive at Los Angeles Port on Feb 28.",
      timestamp: "8 hours ago",
      actionLabel: "Track",
      isRead: false,
      link: "/dashboard/shipments/NV-9921",
    },
    {
      id: "6",
      type: "system",
      icon: "alert",
      title: "Security Alert",
      badge: "SECURITY",
      badgeColor: "#EF4444",
      description:
        "New login detected from IP 192.168.1.1. If this wasn't you, please secure your account immediately.",
      timestamp: "12 hours ago",
      actionLabel: "Review",
      isRead: false,
      link: "/dashboard/settings/security",
    },
    {
      id: "7",
      type: "shipments",
      icon: "shipment",
      title: "Customs Clearance Completed",
      badge: "SHIPMENT #NV-9918",
      badgeColor: "#137FEC",
      description:
        "Customs clearance completed for shipment #NV-9918 at Dubai Port. Ready for final delivery.",
      timestamp: "Yesterday at 11:30 PM",
      actionLabel: "View Details",
      isRead: true,
      link: "/dashboard/shipments/NV-9918",
    },
    {
      id: "8",
      type: "settlements",
      icon: "contract",
      title: "Settlement Pending",
      badge: "PENDING",
      badgeColor: "#F59E0B",
      description:
        "Settlement for shipment #NV-9917 is pending approval. Expected completion in 24 hours.",
      timestamp: "Yesterday at 6:45 PM",
      actionLabel: "View Contract",
      isRead: true,
      link: "/dashboard/settlements",
    },
    {
      id: "9",
      type: "system",
      icon: "system",
      title: "System Maintenance Scheduled",
      description:
        "Routine maintenance is scheduled for Friday 23:00 UTC. The platform will be unavailable for approx 30 mins.",
      timestamp: "Yesterday at 4:30 PM",
      isRead: true,
      link: "/dashboard",
    },
    {
      id: "10",
      type: "shipments",
      icon: "shipment",
      title: "Shipment Departed",
      badge: "SHIPMENT #NV-9815",
      badgeColor: "#137FEC",
      description:
        "Vessel 'Ever Green' has departed from Rotterdam Port en route to New York.",
      timestamp: "Yesterday at 10:15 AM",
      isRead: true,
      link: "/dashboard/shipments/NV-9815",
    },
    {
      id: "11",
      type: "settlements",
      icon: "invoice",
      title: "Invoice Generated",
      badge: "INV-2026-001",
      badgeColor: "#6B7280",
      description:
        "Monthly invoice for October services has been generated and sent to finance.",
      timestamp: "Yesterday at 9:00 AM",
      isRead: true,
      link: "/dashboard/settlements",
    },
    {
      id: "12",
      type: "shipments",
      icon: "alert",
      title: "Delivery Delayed",
      badge: "SHIPMENT #NV-9810",
      badgeColor: "#FB923C",
      description:
        "Shipment #NV-9810 has been delayed due to weather conditions. New ETA: March 2, 2026.",
      timestamp: "2 days ago",
      actionLabel: "View Details",
      isRead: true,
      link: "/dashboard/shipments/NV-9810",
    },
    {
      id: "13",
      type: "settlements",
      icon: "payment",
      title: "Payment Processed",
      badge: "PAYMENT #PAY-1020",
      badgeColor: "#4ADE80",
      description:
        "Payment of 850 USDC has been processed for carrier services on shipment #NV-9808.",
      timestamp: "2 days ago",
      actionLabel: "View Details",
      isRead: true,
      link: "/dashboard/settlements",
    },
    {
      id: "14",
      type: "shipments",
      icon: "shipment",
      title: "Shipment Delivered",
      badge: "SHIPMENT #NV-9805",
      badgeColor: "#4ADE80",
      description:
        "Shipment #NV-9805 has been successfully delivered to the destination. Customer signature received.",
      timestamp: "3 days ago",
      actionLabel: "View Proof",
      isRead: true,
      link: "/dashboard/shipments/NV-9805",
    },
    {
      id: "15",
      type: "system",
      icon: "system",
      title: "Platform Update",
      badge: "UPDATE v2.1.0",
      badgeColor: "#8B5CF6",
      description:
        "New features added: Enhanced tracking, multi-currency support, and improved analytics dashboard.",
      timestamp: "3 days ago",
      actionLabel: "Learn More",
      isRead: true,
      link: "/dashboard/updates",
    },
    {
      id: "16",
      type: "settlements",
      icon: "contract",
      title: "Contract Renewal Due",
      badge: "CONTRACT #CNT-445",
      badgeColor: "#F59E0B",
      description:
        "Your contract with Carrier C is due for renewal in 7 days. Please review and renew to avoid service interruption.",
      timestamp: "4 days ago",
      actionLabel: "Renew",
      isRead: true,
      link: "/dashboard/contracts",
    },
  ]);

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "shipment":
        return <Truck size={20} />;
      case "contract":
        return <FileText size={20} />;
      case "alert":
        return <AlertTriangle size={20} />;
      case "system":
        return <Server size={20} />;
      case "invoice":
        return <Receipt size={20} />;
      case "payment":
        return <DollarSign size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList(
      notificationsList.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotificationsList(
      notificationsList.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const filteredNotifications = notificationsList.filter((notification) => {
    const matchesFilter =
      activeFilter === "all" || notification.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      notification.badge?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getFilterCount = (type: NotificationType) => {
    if (type === "all") return notificationsList.length;
    return notificationsList.filter((n) => n.type === type).length;
  };

  const todayNotifications = paginatedNotifications.filter((n) => !n.isRead);
  const olderNotifications = paginatedNotifications.filter((n) => n.isRead);

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-left">
          <img src="/plan.svg" alt="Plan Icon" />
          <p>NAVIN</p>
        </div>
        <div className="header-right">
          <nav className="nav-link">
            <span>Dashboard</span>
            <span>Shipments</span>
            <span>Settlements</span>
            <span>Contracts</span>
            <span>Network</span>
          </nav>
          <div className="header-icons">
            <div className="icon-button active">
              <Bell size={20} />
            </div>
            <div className="icon-button">
              <Settings size={20} />
            </div>
            <div className="icon-button">
              <UserCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="notifications-content">
        <div className="content-header">
          <div>
            <h1>Notifications</h1>
            <p className="subtitle">
              Stay updated with your supply chain events and settlements.
            </p>
          </div>
          <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
            <Check size={16} />
            Mark all as read
          </button>
        </div>

        <div className="filters-section">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All <span className="count">{getFilterCount("all")}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === "shipments" ? "active" : ""}`}
              onClick={() => setActiveFilter("shipments")}
            >
              Shipments{" "}
              <span className="count">{getFilterCount("shipments")}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === "settlements" ? "active" : ""}`}
              onClick={() => setActiveFilter("settlements")}
            >
              Settlements{" "}
              <span className="count">{getFilterCount("settlements")}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === "system" ? "active" : ""}`}
              onClick={() => setActiveFilter("system")}
            >
              System <span className="count">{getFilterCount("system")}</span>
            </button>
          </div>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by ID, contract, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} />
              <h3>No notifications found</h3>
              <p>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "You're all caught up! No notifications in this category."}
              </p>
            </div>
          ) : (
            <>
              {todayNotifications.length > 0 && (
                <>
                  <div className="section-label">TODAY</div>
                  {todayNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-card ${notification.isRead ? "read" : ""}`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className={`notification-icon ${notification.icon}`}>
                        {getIconComponent(notification.icon)}
                        {!notification.isRead && (
                          <div className="unread-dot"></div>
                        )}
                      </div>
                      <div className="notification-content">
                        <div className="notification-header">
                          <span className="notification-title">
                            {notification.title}
                          </span>
                          {notification.badge && (
                            <span
                              className="notification-badge"
                              style={{
                                backgroundColor: notification.badgeColor,
                                borderColor: notification.badgeColor,
                              }}
                            >
                              {notification.badge}
                            </span>
                          )}
                        </div>
                        <p className="notification-description">
                          {notification.description}
                        </p>
                        <span className="notification-timestamp">
                          {notification.timestamp}
                        </span>
                      </div>
                      <div className="notification-actions">
                        {notification.actionLabel && (
                          <button
                            className={`action-btn ${notification.actionLabel === "View Contract" ? "transparent" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to link
                            }}
                          >
                            {notification.actionLabel}
                          </button>
                        )}
                        <button
                          className="check-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification.id);
                          }}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {olderNotifications.length > 0 && (
                <>
                  <div className="section-label">EARLIER</div>
                  {olderNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-card ${notification.isRead ? "read" : ""}`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className={`notification-icon ${notification.icon}`}>
                        {getIconComponent(notification.icon)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-header">
                          <span className="notification-title">
                            {notification.title}
                          </span>
                          {notification.badge && (
                            <span
                              className="notification-badge"
                              style={{
                                backgroundColor: notification.badgeColor,
                                borderColor: notification.badgeColor,
                              }}
                            >
                              {notification.badge}
                            </span>
                          )}
                        </div>
                        <p className="notification-description">
                          {notification.description}
                        </p>
                        <span className="notification-timestamp">
                          {notification.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
