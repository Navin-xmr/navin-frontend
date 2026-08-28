import React, { useEffect, useRef, useState } from 'react';
import {
  MoreVertical,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Flag,
  Download,
  Share2,
  MessageCircle,
  Copy,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ShipmentStatus = 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface ShipmentActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** If true, visually styled as a destructive action */
  destructive?: boolean;
  /** If true, rendered as a visual separator before this item */
  divider?: boolean;
  onClick: () => void;
}

export interface ShipmentActionMenuProps {
  shipmentId: string;
  status: ShipmentStatus;
  onViewDetails?: (id: string) => void;
  onUpdateStatus?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onCancelShipment?: (id: string) => void;
  onFlagPriority?: (id: string) => void;
  onDownloadDocs?: (id: string) => void;
  onShareTracking?: (id: string) => void;
  onContactSupport?: (id: string) => void;
  onCopyId?: (id: string) => void;
  /** Placement of the dropdown relative to the trigger button */
  placement?: 'bottom-right' | 'bottom-left';
  className?: string;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function buildActions(
  shipmentId: string,
  status: ShipmentStatus,
  handlers: Pick<
    ShipmentActionMenuProps,
    | 'onViewDetails'
    | 'onUpdateStatus'
    | 'onMarkDelivered'
    | 'onCancelShipment'
    | 'onFlagPriority'
    | 'onDownloadDocs'
    | 'onShareTracking'
    | 'onContactSupport'
    | 'onCopyId'
  >,
): ShipmentActionItem[] {
  const actions: ShipmentActionItem[] = [];

  // Always available
  actions.push({
    id: 'view-details',
    label: 'View Details',
    icon: <Eye className="w-4 h-4" />,
    onClick: () => handlers.onViewDetails?.(shipmentId),
  });

  actions.push({
    id: 'copy-id',
    label: 'Copy Shipment ID',
    icon: <Copy className="w-4 h-4" />,
    onClick: () => handlers.onCopyId?.(shipmentId),
  });

  // Status-conditional actions
  if (status === 'CREATED' || status === 'IN_TRANSIT') {
    actions.push({
      id: 'update-status',
      label: 'Update Status',
      icon: <RefreshCw className="w-4 h-4" />,
      divider: true,
      onClick: () => handlers.onUpdateStatus?.(shipmentId),
    });
  }

  if (status === 'IN_TRANSIT') {
    actions.push({
      id: 'mark-delivered',
      label: 'Mark as Delivered',
      icon: <CheckCircle2 className="w-4 h-4" />,
      onClick: () => handlers.onMarkDelivered?.(shipmentId),
    });
  }

  if (status === 'CREATED' || status === 'IN_TRANSIT') {
    actions.push({
      id: 'flag-priority',
      label: 'Flag as Priority',
      icon: <Flag className="w-4 h-4" />,
      onClick: () => handlers.onFlagPriority?.(shipmentId),
    });
  }

  // Document & sharing actions (not for cancelled)
  if (status !== 'CANCELLED') {
    actions.push({
      id: 'download-docs',
      label: 'Download Documents',
      icon: <Download className="w-4 h-4" />,
      divider: true,
      onClick: () => handlers.onDownloadDocs?.(shipmentId),
    });

    actions.push({
      id: 'share-tracking',
      label: 'Share Tracking Link',
      icon: <Share2 className="w-4 h-4" />,
      onClick: () => handlers.onShareTracking?.(shipmentId),
    });
  }

  // Support is always available
  actions.push({
    id: 'contact-support',
    label: 'Contact Support',
    icon: <MessageCircle className="w-4 h-4" />,
    divider: true,
    onClick: () => handlers.onContactSupport?.(shipmentId),
  });

  // Destructive: only for non-terminal statuses
  if (status === 'CREATED' || status === 'IN_TRANSIT') {
    actions.push({
      id: 'cancel-shipment',
      label: 'Cancel Shipment',
      icon: <XCircle className="w-4 h-4" />,
      destructive: true,
      onClick: () => handlers.onCancelShipment?.(shipmentId),
    });
  }

  return actions;
}

// ── Component ─────────────────────────────────────────────────────────────────

const ShipmentActionMenu: React.FC<ShipmentActionMenuProps> = ({
  shipmentId,
  status,
  onViewDetails,
  onUpdateStatus,
  onMarkDelivered,
  onCancelShipment,
  onFlagPriority,
  onDownloadDocs,
  onShareTracking,
  onContactSupport,
  onCopyId,
  placement = 'bottom-right',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const actions = buildActions(shipmentId, status, {
    onViewDetails,
    onUpdateStatus,
    onMarkDelivered,
    onCancelShipment,
    onFlagPriority,
    onDownloadDocs,
    onShareTracking,
    onContactSupport,
    onCopyId,
  });

  const placementClass =
    placement === 'bottom-left' ? 'left-0' : 'right-0';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for shipment ${shipmentId}`}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent text-text-secondary hover:text-text-primary hover:border-border hover:bg-background-elevated transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-background-card"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          aria-label={`Shipment ${shipmentId} actions`}
          className={`absolute z-50 mt-1 w-52 ${placementClass} bg-background-elevated border border-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-1 animate-fade-in-up`}
        >
          {actions.map((action) => (
            <React.Fragment key={action.id}>
              {action.divider && (
                <div className="my-1 border-t border-border" role="separator" />
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors focus:outline-none focus:bg-background-card ${
                  action.destructive
                    ? 'text-accent-red hover:bg-accent-red/10'
                    : 'text-text-primary hover:bg-background-card hover:text-white'
                }`}
              >
                <span
                  className={`shrink-0 ${action.destructive ? 'text-accent-red' : 'text-text-secondary'}`}
                >
                  {action.icon}
                </span>
                {action.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShipmentActionMenu;
