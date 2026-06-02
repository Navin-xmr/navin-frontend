import {
  Bell, Settings, UserCircle, Search, Check,
  Truck, FileText, AlertTriangle, Server, Receipt, DollarSign,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const iconStyles: Record<string, string> = {
  shipment: "bg-[rgba(37,99,235,0.1)] text-[#3b82f6]",
  contract: "bg-[rgba(5,150,105,0.1)] text-[#10b981]",
  alert:    "bg-[rgba(220,38,38,0.1)] text-[#ef4444]",
  system:   "bg-[rgba(107,114,128,0.1)] text-[#9ca3af]",
  invoice:  "bg-[rgba(107,114,128,0.1)] text-[#9ca3af]",
  payment:  "bg-[rgba(74,222,128,0.1)] text-[#4ade80]",
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<NotificationType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [notificationsList, setNotificationsList] = useState<Notification[]>([
    { id: "1",  type: "shipments",   icon: "shipment", title: "Shipment Arrived at Port",       badge: "SHIPMENT #NV-9920", badgeColor: "#137FEC", description: "The container has cleared customs in Singapore and is ready for last-mile delivery. All documents have been verified on-chain.", timestamp: "2 mins ago",              actionLabel: "View Details",   isRead: false, link: "/dashboard/shipments/NV-9920" },
    { id: "2",  type: "settlements", icon: "contract", title: "Smart Contract Executed",         badge: "USDC SETTLEMENT",   badgeColor: "#4ADE80", description: "Payment of 500 USDC has been automatically released to Carrier A following successful delivery confirmation.",              timestamp: "1 hour ago",              actionLabel: "View Contract",  isRead: false, link: "/dashboard/settlements" },
    { id: "3",  type: "shipments",   icon: "alert",    title: "Documentation Required",          badge: "ACTION NEEDED",     badgeColor: "#FB923C", description: "Shipment #NV-8812 is missing the 'Bill of Lading' document. Upload immediately to prevent delays.",                        timestamp: "3 hours ago",             actionLabel: "Upload",         isRead: false, link: "/dashboard/shipments/NV-8812" },
    { id: "4",  type: "settlements", icon: "payment",  title: "Payment Received",                badge: "PAYMENT #PAY-1024", badgeColor: "#4ADE80", description: "Payment of 1,200 USDC received from Client B for shipment #NV-9815.",                                                     timestamp: "5 hours ago",             actionLabel: "View Details",   isRead: false, link: "/dashboard/settlements" },
    { id: "5",  type: "shipments",   icon: "shipment", title: "Shipment In Transit",             badge: "SHIPMENT #NV-9921", badgeColor: "#137FEC", description: "Your shipment is currently in transit and expected to arrive at Los Angeles Port on Feb 28.",                              timestamp: "8 hours ago",             actionLabel: "Track",          isRead: false, link: "/dashboard/shipments/NV-9921" },
    { id: "6",  type: "system",      icon: "alert",    title: "Security Alert",                  badge: "SECURITY",          badgeColor: "#EF4444", description: "New login detected from IP 192.168.1.1. If this wasn't you, please secure your account immediately.",                       timestamp: "12 hours ago",            actionLabel: "Review",         isRead: false, link: "/dashboard/settings/security" },
    { id: "7",  type: "shipments",   icon: "shipment", title: "Customs Clearance Completed",     badge: "SHIPMENT #NV-9918", badgeColor: "#137FEC", description: "Customs clearance completed for shipment #NV-9918 at Dubai Port. Ready for final delivery.",                              timestamp: "Yesterday at 11:30 PM",   actionLabel: "View Details",   isRead: true,  link: "/dashboard/shipments/NV-9918" },
    { id: "8",  type: "settlements", icon: "contract", title: "Settlement Pending",              badge: "PENDING",           badgeColor: "#F59E0B", description: "Settlement for shipment #NV-9917 is pending approval. Expected completion in 24 hours.",                                   timestamp: "Yesterday at 6:45 PM",    actionLabel: "View Contract",  isRead: true,  link: "/dashboard/settlements" },
    { id: "9",  type: "system",      icon: "system",   title: "System Maintenance Scheduled",                                                       description: "Routine maintenance is scheduled for Friday 23:00 UTC. The platform will be unavailable for approx 30 mins.",              timestamp: "Yesterday at 4:30 PM",                                   isRead: true,  link: "/dashboard" },
    { id: "10", type: "shipments",   icon: "shipment", title: "Shipment Departed",               badge: "SHIPMENT #NV-9815", badgeColor: "#137FEC", description: "Vessel 'Ever Green' has departed from Rotterdam Port en route to New York.",                                               timestamp: "Yesterday at 10:15 AM",                                  isRead: true,  link: "/dashboard/shipments/NV-9815" },
    { id: "11", type: "settlements", icon: "invoice",  title: "Invoice Generated",               badge: "INV-2026-001",      badgeColor: "#6B7280", description: "Monthly invoice for October services has been generated and sent to finance.",                                              timestamp: "Yesterday at 9:00 AM",                                   isRead: true,  link: "/dashboard/settlements" },
    { id: "12", type: "shipments",   icon: "alert",    title: "Delivery Delayed",                badge: "SHIPMENT #NV-9810", badgeColor: "#FB923C", description: "Shipment #NV-9810 has been delayed due to weather conditions. New ETA: March 2, 2026.",                                   timestamp: "2 days ago",              actionLabel: "View Details",   isRead: true,  link: "/dashboard/shipments/NV-9810" },
    { id: "13", type: "settlements", icon: "payment",  title: "Payment Processed",               badge: "PAYMENT #PAY-1020", badgeColor: "#4ADE80", description: "Payment of 850 USDC has been processed for carrier services on shipment #NV-9808.",                                       timestamp: "2 days ago",              actionLabel: "View Details",   isRead: true,  link: "/dashboard/settlements" },
    { id: "14", type: "shipments",   icon: "shipment", title: "Shipment Delivered",              badge: "SHIPMENT #NV-9805", badgeColor: "#4ADE80", description: "Shipment #NV-9805 has been successfully delivered to the destination. Customer signature received.",                       timestamp: "3 days ago",              actionLabel: "View Proof",     isRead: true,  link: "/dashboard/shipments/NV-9805" },
    { id: "15", type: "system",      icon: "system",   title: "Platform Update",                 badge: "UPDATE v2.1.0",     badgeColor: "#8B5CF6", description: "New features added: Enhanced tracking, multi-currency support, and improved analytics dashboard.",                         timestamp: "3 days ago",              actionLabel: "Learn More",     isRead: true,  link: "/dashboard/updates" },
    { id: "16", type: "settlements", icon: "contract", title: "Contract Renewal Due",            badge: "CONTRACT #CNT-445", badgeColor: "#F59E0B", description: "Your contract with Carrier C is due for renewal in 7 days. Please review and renew to avoid service interruption.",        timestamp: "4 days ago",              actionLabel: "Renew",          isRead: true,  link: "/dashboard/contracts" },
  ]);

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "shipment": return <Truck size={20} />;
      case "contract": return <FileText size={20} />;
      case "alert":    return <AlertTriangle size={20} />;
      case "system":   return <Server size={20} />;
      case "invoice":  return <Receipt size={20} />;
      case "payment":  return <DollarSign size={20} />;
      default:         return <Bell size={20} />;
    }
  };

  const handleMarkAllAsRead = () =>
    setNotificationsList(notificationsList.map((n) => ({ ...n, isRead: true })));

  const handleNotificationClick = (id: string) => {
    const notification = notificationsList.find((n) => n.id === id);
    setNotificationsList(notificationsList.map((n) => n.id === id ? { ...n, isRead: true } : n));
    if (notification?.link) navigate(notification.link);
  };

  const filteredNotifications = notificationsList.filter((n) => {
    const matchesFilter = activeFilter === "all" || n.type === activeFilter;
    const matchesSearch = searchQuery === "" ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.badge?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  const getFilterCount = (type: NotificationType) =>
    type === "all" ? notificationsList.length : notificationsList.filter((n) => n.type === type).length;

  const todayNotifications = paginatedNotifications.filter((n) => !n.isRead);
  const olderNotifications = paginatedNotifications.filter((n) => n.isRead);

  const filters: { key: NotificationType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "shipments", label: "Shipments" },
    { key: "settlements", label: "Settlements" },
    { key: "system", label: "System" },
  ];

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <div
      className={`border rounded-xl p-5 flex gap-4 transition-all cursor-pointer ${
        notification.isRead
          ? "bg-[#1a1f28] border-[#374151]"
          : "bg-[#1f2937] border-[#374151] hover:bg-[#283039] hover:border-[#4b5563]"
      }`}
      onClick={() => handleNotificationClick(notification.id)}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative ${iconStyles[notification.icon]}`}>
        {getIconComponent(notification.icon)}
        {!notification.isRead && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-[#3b82f6] rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-base font-semibold ${notification.isRead ? "text-[#6b7280] font-medium" : "text-white font-bold"}`}>
            {notification.title}
          </span>
          {notification.badge && (
            <span
              className="px-2.5 py-1 rounded text-[11px] font-semibold tracking-[0.5px] text-white inline-flex items-center whitespace-nowrap leading-none"
              style={notification.isRead
                ? { backgroundColor: 'transparent', border: `1px solid ${notification.badgeColor}`, color: notification.badgeColor }
                : { backgroundColor: notification.badgeColor, borderColor: notification.badgeColor }}
            >
              {notification.badge}
            </span>
          )}
        </div>
        <p className={`text-sm leading-[1.5] m-0 ${notification.isRead ? "text-[#6b7280]" : "text-[#9ca3af]"}`}>
          {notification.description}
        </p>
        <span className="text-xs text-[#6b7280]">{notification.timestamp}</span>
      </div>

      {/* Actions */}
      {!notification.isRead && (
        <div className="flex items-center gap-2 shrink-0">
          {notification.actionLabel && (
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all border ${
                notification.actionLabel === "View Contract"
                  ? "bg-transparent text-[#2563eb] border-[#2563eb] hover:bg-[#2563eb] hover:text-white"
                  : "bg-[#2563eb] border-[#2563eb] text-white hover:bg-[#1d4ed8] hover:border-[#1d4ed8]"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {notification.actionLabel}
            </button>
          )}
          <button
            className="w-9 h-9 rounded-md bg-transparent border border-[#374151] flex items-center justify-center cursor-pointer transition-all text-[#6b7280] hover:bg-[#374151] hover:border-[#4b5563] hover:text-white"
            onClick={(e) => { e.stopPropagation(); handleNotificationClick(notification.id); }}
          >
            <Check size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#101922] min-h-screen text-white">
      {/* Header */}
      <div className="bg-[#111418] w-full border-b border-[#283039] px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/plan.svg" alt="Plan Icon" className="w-8 h-8" />
          <p className="text-lg font-semibold m-0 tracking-[0.5px]">NAVIN</p>
        </div>
        <div className="flex items-center gap-8">
          <nav className="flex gap-8">
            {["Dashboard", "Shipments", "Settlements", "Contracts", "Network"].map((item) => (
              <span key={item} className="cursor-pointer text-sm text-[#9ca3af] hover:text-white transition-colors">{item}</span>
            ))}
          </nav>
          <div className="flex gap-3">
            {[{ icon: <Bell size={20} />, active: true }, { icon: <Settings size={20} /> }, { icon: <UserCircle size={20} /> }].map(({ icon, active }, i) => (
              <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${active ? "bg-[#2563eb] text-white" : "bg-[#1f2937] text-[#9ca3af] hover:bg-[#374151]"}`}>
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Content header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[32px] font-semibold m-0 mb-2">Notifications</h1>
            <p className="text-[#9ca3af] text-sm m-0">Stay updated with your supply chain events and settlements.</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-[#283039] border border-[#374151] rounded-lg text-white text-sm cursor-pointer transition-all hover:bg-[#1f2937] hover:border-[#4b5563]"
            onClick={handleMarkAllAsRead}
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-8 gap-6 border-b border-[#283039] pb-5 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {filters.map(({ key, label }) => (
              <button
                key={key}
                className={`px-4 py-2.5 border-none rounded-[20px] text-sm cursor-pointer transition-all flex items-center gap-2 ${
                  activeFilter === key ? "bg-[#2563eb] text-white" : "bg-transparent text-[#9ca3af] hover:bg-[#1f2937] hover:text-white"
                }`}
                onClick={() => setActiveFilter(key)}
              >
                {label}
                <span className="bg-[rgba(255,255,255,0.2)] px-2 py-0.5 rounded-xl text-xs font-semibold">
                  {getFilterCount(key)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-[#1f2937] border border-[#374151] rounded-lg px-4 py-2.5 flex-1 max-w-[400px]">
            <Search size={18} className="text-[#6b7280] shrink-0" />
            <input
              type="text"
              placeholder="Search by ID, contract, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder:text-[#6b7280]"
            />
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex flex-col gap-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-[#6b7280]">
              <Bell size={48} className="mb-6 opacity-50" />
              <h3 className="text-xl font-semibold text-[#9ca3af] m-0 mb-2">No notifications found</h3>
              <p className="text-sm m-0">
                {searchQuery ? "Try adjusting your search terms" : "You're all caught up! No notifications in this category."}
              </p>
            </div>
          ) : (
            <>
              {todayNotifications.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-[#6b7280] tracking-[0.5px] mt-4 mb-2">TODAY</div>
                  {todayNotifications.map((n) => <NotificationCard key={n.id} notification={n} />)}
                </>
              )}
              {olderNotifications.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-[#6b7280] tracking-[0.5px] mt-4 mb-2">EARLIER</div>
                  {olderNotifications.map((n) => <NotificationCard key={n.id} notification={n} />)}
                </>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 py-5">
                  <button
                    className="px-5 py-2.5 bg-[#1f2937] border border-[#374151] rounded-lg text-[#9ca3af] text-sm cursor-pointer transition-all hover:not-disabled:bg-[#374151] hover:not-disabled:border-[#4b5563] hover:not-disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-[#9ca3af] text-sm">Page {currentPage} of {totalPages}</span>
                  <button
                    className="px-5 py-2.5 bg-[#1f2937] border border-[#374151] rounded-lg text-[#9ca3af] text-sm cursor-pointer transition-all hover:not-disabled:bg-[#374151] hover:not-disabled:border-[#4b5563] hover:not-disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
