import React, { useEffect, useState } from 'react';
import Modal from '../../common/Modal/Modal';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setName('');
        setError('');
        setIsSaving(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Template name is required.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save as Template"
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            className="px-4 py-2 rounded-lg bg-[#3b82f6] text-sm font-semibold text-white hover:bg-[#2563eb] transition-colors cursor-pointer disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save Template'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="m-0 text-sm text-[#94a3b8]">
          Save the current shipment details as a reusable template. Delivery date and tracking
          information are excluded.
        </p>
        <div>
          <label htmlFor="template-name" className="mb-1 block text-sm font-medium text-white">
            Template name
          </label>
          <input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., NYC to LA Standard"
            className="w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
            autoFocus
          />
          {error && (
            <p className="mt-1 text-xs text-[#ef4444]" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SaveTemplateModal;
