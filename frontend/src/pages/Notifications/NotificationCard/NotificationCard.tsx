import { Bell, Truck, FileText, AlertTriangle, Server, Receipt, DollarSign, Check, Trash2 } from "lucide-react";
import type { Notification as NotificationType } from "@services/api/endpoints/notifications";

export interface NotificationCardActions {
  isSelected: (id: string) => boolean;
  toggleOne: (id: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface NotificationCardProps extends NotificationCardActions {
  notification: NotificationType;
  compact?: boolean;
}

const iconStyles: Record<string, string> = {
  shipment: "bg-[rgba(37,99,235,0.1)] text-accent-blue",
  contract: "bg-[rgba(5,150,105,0.1)] text-accent-green",
  alert: "bg-[rgba(220,38,38,0.1)] text-accent-red",
  system: "bg-[rgba(107,114,128,0.1)] text-text-secondary",
  invoice: "bg-[rgba(107,114,128,0.1)] text-text-secondary",
  payment: "bg-[rgba(74,222,128,0.1)] text-[#4ade80]",
};

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

const NotificationCard = ({ notification, compact = false, isSelected, toggleOne, onOpen, onDelete }: NotificationCardProps) => (
  <div
    role="article"
    tabIndex={0}
    className={`border rounded-xl flex gap-4 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#101922] ${
      compact ? "p-3" : "p-5"
    } ${
      notification.isRead
        ? "bg-[#1a1f28] border-[#374151]"
        : "bg-[#1f2937] border-[#374151] hover:bg-[#283039] hover:border-[#4b5563]"
    }`}
    onClick={() => onOpen(notification.id)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen(notification.id);
      }
    }}
  >
    <div className="flex items-center shrink-0 self-start pt-1">
      <input
        type="checkbox"
        aria-label={`Select notification: ${notification.title}`}
        checked={isSelected(notification.id)}
        onClick={(e) => e.stopPropagation()}
        onChange={() => toggleOne(notification.id)}
        className="w-4 h-4 rounded border-[#374151] bg-transparent text-[#2563eb] focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
      />
    </div>
    <div
      className={`rounded-full flex items-center justify-center shrink-0 relative ${compact ? "w-8 h-8" : "w-12 h-12"} ${iconStyles[notification.icon]}`}
    >
      {getIconComponent(notification.icon)}
      {!notification.isRead && (
        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent-blue rounded-full" />
      )}
    </div>

    <div className={`flex-1 flex flex-col ${compact ? "gap-0.5" : "gap-2"}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`${compact ? "text-sm" : "text-base"} font-semibold ${notification.isRead ? "text-[#6b7280] font-medium" : "text-white font-bold"}`}
        >
          {notification.title}
        </span>
        {notification.badge && (
          <span
            className="px-2.5 py-1 rounded text-[11px] font-semibold tracking-[0.5px] text-white inline-flex items-center whitespace-nowrap leading-none"
            style={
              notification.isRead
                ? {
                    backgroundColor: "transparent",
                    border: `1px solid ${notification.badgeColor}`,
                    color: notification.badgeColor,
                  }
                : {
                    backgroundColor: notification.badgeColor,
                    borderColor: notification.badgeColor,
                  }
            }
          >
            {notification.badge}
          </span>
        )}
      </div>
      {!compact && (
        <p
          className={`text-sm leading-[1.5] m-0 ${notification.isRead ? "text-[#6b7280]" : "text-text-secondary"}`}
        >
          {notification.description}
        </p>
      )}
      <span className="text-xs text-[#6b7280]">{notification.timestamp}</span>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {!notification.isRead && (
        <button
          className="w-9 h-9 rounded-md bg-transparent border border-[#374151] flex items-center justify-center cursor-pointer transition-all text-[#6b7280] hover:bg-[#374151] hover:border-[#4b5563] hover:text-white focus-visible:outline-2 focus-visible:outline-accent-blue"
          aria-label="Mark as read"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(notification.id);
          }}
        >
          <Check size={16} />
        </button>
      )}
      <button
        className="w-9 h-9 rounded-md bg-transparent border border-[#374151] flex items-center justify-center cursor-pointer transition-all text-[#6b7280] hover:bg-[#374151] hover:border-[#4b5563] hover:text-white focus-visible:outline-2 focus-visible:outline-accent-blue"
        aria-label="Delete notification"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default NotificationCard;
