import React, { useEffect, useMemo, useRef, useState } from 'react';
import './StatusUpdate.css';

export type ShipmentMilestone =
  | 'Picked Up'
  | 'In Transit'
  | 'At Checkpoint'
  | 'Out for Delivery'
  | 'Delivered';

export interface StatusUpdateProps {
  shipmentId: string;
  currentStatus?: ShipmentMilestone;
  onStatusUpdate?: (shipmentId: string, nextStatus: ShipmentMilestone) => Promise<void>;
}

const MILESTONE_OPTIONS: ShipmentMilestone[] = [
  'Picked Up',
  'In Transit',
  'At Checkpoint',
  'Out for Delivery',
  'Delivered',
];

const StatusUpdate: React.FC<StatusUpdateProps> = ({
  shipmentId,
  currentStatus,
  onStatusUpdate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ShipmentMilestone | null>(null);
  const [activeStatus, setActiveStatus] = useState<ShipmentMilestone | undefined>(currentStatus);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setActiveStatus(currentStatus);
  }, [currentStatus]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const dialogMessage = useMemo(() => {
    if (!pendingStatus) {
      return '';
    }

    return `Update shipment #${shipmentId} to ${pendingStatus}?`;
  }, [pendingStatus, shipmentId]);

  const openConfirmation = (status: ShipmentMilestone) => {
    setErrorMessage('');
    setIsMenuOpen(false);
    setPendingStatus(status);
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setPendingStatus(null);
    triggerRef.current?.focus();
  };

  const handleConfirm = async () => {
    if (!pendingStatus) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage('');

    try {
      if (onStatusUpdate) {
        await onStatusUpdate(shipmentId, pendingStatus);
      }

      setActiveStatus(pendingStatus);
      setSuccessMessage(`Shipment #${shipmentId} updated to ${pendingStatus}.`);
      setIsDialogOpen(false);
      setPendingStatus(null);
      triggerRef.current?.focus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update shipment status.';
      setErrorMessage(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="status-update" ref={containerRef}>
      <button
        type="button"
        className="status-update-trigger"
        onClick={() => setIsMenuOpen(prev => !prev)}
        aria-expanded={isMenuOpen}
        aria-haspopup="listbox"
        aria-label={`Update status for shipment ${shipmentId}`}
        ref={triggerRef}
      >
        {activeStatus ? `Status: ${activeStatus}` : 'Update Status'}
      </button>

      {isMenuOpen && (
        <ul className="status-update-menu" role="listbox" aria-label="Shipment milestones">
          {MILESTONE_OPTIONS.map(status => (
            <li key={status}>
              <button
                type="button"
                className="status-update-option"
                onClick={() => openConfirmation(status)}
              >
                {status}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isDialogOpen && pendingStatus && (
        <div className="status-update-dialog-backdrop">
          <div
            className="status-update-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`status-update-title-${shipmentId}`}
            aria-describedby={`status-update-message-${shipmentId}`}
          >
            <h3 id={`status-update-title-${shipmentId}`}>Confirm status update</h3>
            <p id={`status-update-message-${shipmentId}`}>{dialogMessage}</p>

            <div className="status-update-actions">
              <button type="button" className="status-update-cancel" onClick={handleCancel} disabled={isUpdating}>
                Cancel
              </button>
              <button
                type="button"
                className="status-update-confirm"
                onClick={handleConfirm}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <p className="status-update-feedback success" role="status" aria-live="polite">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="status-update-feedback error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default StatusUpdate;
