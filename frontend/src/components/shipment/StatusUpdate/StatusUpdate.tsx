import React, { useEffect, useMemo, useRef, useState } from 'react';

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

  useEffect(() => { setActiveStatus(currentStatus); }, [currentStatus]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(''), 3000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const dialogMessage = useMemo(() => {
    if (!pendingStatus) return '';
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
    if (!pendingStatus) return;
    setIsUpdating(true);
    setErrorMessage('');
    try {
      if (onStatusUpdate) await onStatusUpdate(shipmentId, pendingStatus);
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
    <div className="relative inline-flex flex-col gap-2" ref={containerRef}>
      <button
        type="button"
        className="border border-border bg-background-elevated text-text-primary rounded-lg px-3 py-2 text-[13px] font-semibold cursor-pointer min-w-[180px] text-left hover:border-accent-blue transition-colors"
        onClick={() => setIsMenuOpen(prev => !prev)}
        aria-expanded={isMenuOpen}
        aria-haspopup="listbox"
        aria-label={`Update status for shipment ${shipmentId}`}
        ref={triggerRef}
      >
        {activeStatus ? `Status: ${activeStatus}` : 'Update Status'}
      </button>

      {isMenuOpen && (
        <ul
          className="list-none m-0 p-1.5 border border-border rounded-[10px] bg-background-card absolute top-[calc(100%+6px)] left-0 min-w-[220px] z-30 shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
          role="listbox"
          aria-label="Shipment milestones"
        >
          {MILESTONE_OPTIONS.map(status => (
            <li key={status}>
              <button
                type="button"
                className="w-full border-none bg-transparent text-text-primary text-left rounded-lg px-2.5 py-2 text-[13px] cursor-pointer hover:bg-[#1a2030] transition-colors"
                onClick={() => openConfirmation(status)}
              >
                {status}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isDialogOpen && pendingStatus && (
        <div className="fixed inset-0 bg-[rgba(2,6,23,0.72)] backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div
            className="w-[min(92vw,420px)] border border-border rounded-[14px] p-[18px] bg-background-card text-text-primary shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`status-update-title-${shipmentId}`}
            aria-describedby={`status-update-message-${shipmentId}`}
          >
            <h3 id={`status-update-title-${shipmentId}`} className="m-0 mb-2 text-[17px] font-semibold">
              Confirm status update
            </h3>
            <p id={`status-update-message-${shipmentId}`} className="m-0 text-text-secondary text-sm">
              {dialogMessage}
            </p>
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-[13px] font-semibold cursor-pointer bg-transparent text-text-primary disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg border border-accent-blue px-3 py-2 text-[13px] font-semibold cursor-pointer bg-accent-blue text-white disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
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
        <p className="m-0 text-xs font-semibold text-accent-green" role="status" aria-live="polite">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="m-0 text-xs font-semibold text-[#f87171]" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default StatusUpdate;
