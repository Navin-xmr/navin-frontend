import React, { useState } from 'react';
import Modal from '../../common/Modal/Modal';
import type { ShipmentStatus } from '../../../services/api/endpoints/shipments';

export interface BulkStatusModalProps {
  isOpen: boolean;
  count: number;
  isLoading: boolean;
  onConfirm: (status: ShipmentStatus) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: 'CREATED', label: 'Created' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const BulkStatusModal: React.FC<BulkStatusModalProps> = ({
  isOpen,
  count,
  isLoading,
  onConfirm,
  onClose,
}) => {
  const [status, setStatus] = useState<ShipmentStatus>('IN_TRANSIT');

  const handleConfirm = () => onConfirm(status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Status"
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#62ffff] text-black hover:bg-[#4ae8e8] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Updating…' : `Update ${count} shipment${count !== 1 ? 's' : ''}`}
          </button>
        </>
      }
    >
      <p className="mb-4 text-text-secondary">
        Select the new status for{' '}
        <span className="font-semibold text-text-primary">{count}</span>{' '}
        selected shipment{count !== 1 ? 's' : ''}.
      </p>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
        className="w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff]"
        aria-label="Select new status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#121620]">
            {opt.label}
          </option>
        ))}
      </select>
    </Modal>
  );
};

export default BulkStatusModal;
