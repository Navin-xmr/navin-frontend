import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Flag,
  Download,
  Share2,
  MessageCircle,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { shipmentApi } from '../../../services/api/endpoints/shipments';
import type { ShipmentDocument, ShipmentStatus } from '../../../services/api/endpoints/shipments';

export interface QuickActionPanelProps {
  shipmentId: string;
  currentStatus?: string;
  onActionComplete?: (action: ActionType, shipmentId: string) => void;
}

export type ActionType =
  | 'update-status'
  | 'mark-delivered'
  | 'flag-priority'
  | 'download-docs'
  | 'share-tracking'
  | 'contact-support';

interface ActionState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface Action {
  id: ActionType;
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
  onClick: () => void;
}

/** Logical next status advanced by the "Update Status" quick action. */
const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  CREATED: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
};

function resolveNextStatus(currentStatus?: string): ShipmentStatus {
  if (currentStatus) {
    const next = NEXT_STATUS[currentStatus as ShipmentStatus];
    if (next) return next;
    throw new Error(`Shipment is already in its final status (${currentStatus}).`);
  }
  return 'IN_TRANSIT';
}

function downloadDocuments(documents: ShipmentDocument[]): void {
  documents.forEach((doc) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}

async function shareTrackingLink(shipmentId: string): Promise<void> {
  const url = `${window.location.origin}/tracking/${shipmentId}`;
  if (navigator.share) {
    await navigator.share({ title: 'Track your shipment', url });
    return;
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }
  throw new Error('Sharing is not supported in this browser.');
}

function openSupportContact(shipmentId: string): void {
  const subject = encodeURIComponent(`Support request for shipment ${shipmentId}`);
  window.open(`mailto:support@navin.io?subject=${subject}`, '_blank');
}

/** Executes the real server/client action behind each quick action type. */
async function executeAction(
  actionType: ActionType,
  shipmentId: string,
  currentStatus?: string,
): Promise<void> {
  switch (actionType) {
    case 'update-status':
      await shipmentApi.updateStatus(shipmentId, resolveNextStatus(currentStatus));
      break;
    case 'mark-delivered':
      await shipmentApi.updateStatus(shipmentId, 'DELIVERED');
      break;
    case 'flag-priority':
      await shipmentApi.updatePriority(shipmentId, 'URGENT');
      break;
    case 'download-docs': {
      const documents = await shipmentApi.getDocuments(shipmentId);
      if (documents.length === 0) {
        throw new Error('No documents are available to download for this shipment.');
      }
      downloadDocuments(documents);
      break;
    }
    case 'share-tracking':
      await shareTrackingLink(shipmentId);
      break;
    case 'contact-support':
      openSupportContact(shipmentId);
      break;
  }
}

const QuickActionPanel: React.FC<QuickActionPanelProps> = ({
  shipmentId,
  currentStatus,
  onActionComplete,
}) => {
  const [actionStates, setActionStates] = useState<Record<ActionType, ActionState>>({
    'update-status': { loading: false, success: false, error: null },
    'mark-delivered': { loading: false, success: false, error: null },
    'flag-priority': { loading: false, success: false, error: null },
    'download-docs': { loading: false, success: false, error: null },
    'share-tracking': { loading: false, success: false, error: null },
    'contact-support': { loading: false, success: false, error: null },
  });

  const handleAction = async (actionType: ActionType) => {
    // Reset state
    setActionStates((prev) => ({
      ...prev,
      [actionType]: { loading: true, success: false, error: null },
    }));

    try {
      // Run the real action (API call / browser share / support contact)
      await executeAction(actionType, shipmentId, currentStatus);

      // Success state
      setActionStates((prev) => ({
        ...prev,
        [actionType]: { loading: false, success: true, error: null },
      }));

      // Call the callback
      if (onActionComplete) {
        onActionComplete(actionType, shipmentId);
      }

      // Auto-clear success state after 3 seconds
      setTimeout(() => {
        setActionStates((prev) => ({
          ...prev,
          [actionType]: { loading: false, success: false, error: null },
        }));
      }, 3000);
    } catch (error) {
      // Error state
      const errorMessage = error instanceof Error ? error.message : 'Action failed';
      setActionStates((prev) => ({
        ...prev,
        [actionType]: { loading: false, success: false, error: errorMessage },
      }));

      // Auto-clear error state after 5 seconds
      setTimeout(() => {
        setActionStates((prev) => ({
          ...prev,
          [actionType]: { loading: false, success: false, error: null },
        }));
      }, 5000);
    }
  };

  const actions: Action[] = [
    {
      id: 'update-status',
      label: 'Update Status',
      icon: <RefreshCw className="w-4 h-4" />,
      ariaLabel: `Update status for shipment ${shipmentId}`,
      onClick: () => handleAction('update-status'),
    },
    {
      id: 'mark-delivered',
      label: 'Mark as Delivered',
      icon: <CheckCircle2 className="w-4 h-4" />,
      ariaLabel: `Mark shipment ${shipmentId} as delivered`,
      onClick: () => handleAction('mark-delivered'),
    },
    {
      id: 'flag-priority',
      label: 'Flag as Priority',
      icon: <Flag className="w-4 h-4" />,
      ariaLabel: `Flag shipment ${shipmentId} as priority`,
      onClick: () => handleAction('flag-priority'),
    },
    {
      id: 'download-docs',
      label: 'Download Documents',
      icon: <Download className="w-4 h-4" />,
      ariaLabel: `Download documents for shipment ${shipmentId}`,
      onClick: () => handleAction('download-docs'),
    },
    {
      id: 'share-tracking',
      label: 'Share Tracking Link',
      icon: <Share2 className="w-4 h-4" />,
      ariaLabel: `Share tracking link for shipment ${shipmentId}`,
      onClick: () => handleAction('share-tracking'),
    },
    {
      id: 'contact-support',
      label: 'Contact Support',
      icon: <MessageCircle className="w-4 h-4" />,
      ariaLabel: `Contact support about shipment ${shipmentId}`,
      onClick: () => handleAction('contact-support'),
    },
  ];

  const getButtonClasses = (state: ActionState) => {
    const baseClasses =
      'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-background-card disabled:cursor-not-allowed';

    if (state.loading) {
      return `${baseClasses} bg-background-elevated border-border text-text-secondary cursor-wait`;
    }

    if (state.success) {
      return `${baseClasses} bg-accent-green/10 border-accent-green text-accent-green`;
    }

    if (state.error) {
      return `${baseClasses} bg-accent-red/10 border-accent-red text-accent-red hover:bg-accent-red/20`;
    }

    return `${baseClasses} bg-background-elevated border-border text-text-primary hover:bg-background-card hover:border-accent-blue/50 active:scale-[0.98]`;
  };

  const renderActionContent = (action: Action) => {
    const state = actionStates[action.id];

    if (state.loading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      );
    }

    if (state.success) {
      return (
        <>
          <Check className="w-4 h-4" />
          <span>Success!</span>
        </>
      );
    }

    if (state.error) {
      return (
        <>
          <X className="w-4 h-4" />
          <span>{state.error}</span>
        </>
      );
    }

    return (
      <>
        {action.icon}
        <span>{action.label}</span>
      </>
    );
  };

  return (
    <div className="bg-background-card border border-border rounded-xl p-5">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base mb-1">Quick Actions</h3>
        <p className="text-text-secondary text-sm">
          Shipment ID: <span className="text-accent-blue font-mono">{shipmentId}</span>
          {currentStatus && (
            <>
              {' · '}
              <span className="text-text-primary">Status: {currentStatus}</span>
            </>
          )}
        </p>
      </div>

      {/* Action Grid - Responsive */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        role="group"
        aria-label="Shipment quick actions"
      >
        {actions.map((action) => {
          const state = actionStates[action.id];
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className={getButtonClasses(state)}
              aria-label={action.ariaLabel}
              aria-busy={state.loading}
              aria-live="polite"
              disabled={state.loading}
            >
              {renderActionContent(action)}
            </button>
          );
        })}
      </div>

      {/* Live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {Object.entries(actionStates).map(([actionId, state]) => {
          if (state.success) {
            return `${actionId} completed successfully`;
          }
          if (state.error) {
            return `${actionId} failed: ${state.error}`;
          }
          if (state.loading) {
            return `${actionId} in progress`;
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default QuickActionPanel;
