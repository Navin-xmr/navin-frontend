import React, { useState } from 'react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

const ConfirmDialogDemo: React.FC = () => {
  const [isOpenDefault, setIsOpenDefault] = useState(false);
  const [isOpenWarning, setIsOpenWarning] = useState(false);
  const [isOpenDanger, setIsOpenDanger] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFakeAction = (closeSetter: (val: boolean) => void) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      closeSetter(false);
    }, 2000);
  };

  return (
    <div className="p-8 bg-background min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-8">Confirm Dialog Demo</h1>
      
      <div className="flex gap-4">
        <button
          onClick={() => setIsOpenDefault(true)}
          className="px-4 py-2 bg-accent-blue rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Open Default
        </button>

        <button
          onClick={() => setIsOpenWarning(true)}
          className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-600 transition"
        >
          Open Warning
        </button>

        <button
          onClick={() => setIsOpenDanger(true)}
          className="px-4 py-2 bg-red-500 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          Open Danger
        </button>
      </div>

      <ConfirmDialog
        isOpen={isOpenDefault}
        onClose={() => setIsOpenDefault(false)}
        onConfirm={() => handleFakeAction(setIsOpenDefault)}
        title="Sync Data"
        message="Are you sure you want to manually sync the ledger? This might take a moment."
        confirmLabel="Sync Now"
        variant="default"
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={isOpenWarning}
        onClose={() => setIsOpenWarning(false)}
        onConfirm={() => handleFakeAction(setIsOpenWarning)}
        title="Cancel Shipment"
        message="Are you sure you want to cancel this shipment? The customer will be notified."
        confirmLabel="Cancel Shipment"
        variant="warning"
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={isOpenDanger}
        onClose={() => setIsOpenDanger(false)}
        onConfirm={() => handleFakeAction(setIsOpenDanger)}
        title="Delete Record"
        message="This action cannot be undone. This will permanently delete the selected records from our servers."
        confirmLabel="Delete Permanently"
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ConfirmDialogDemo;
