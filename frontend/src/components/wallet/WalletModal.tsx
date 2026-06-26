import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useWallet } from '../../context/WalletContext';
import { WALLET_ADAPTERS } from '../../services/stellar/adapters';
import type { WalletAdapter } from '../../services/stellar/adapters/types';
import NetworkBadge from './NetworkBadge';

type AvailabilityMap = Record<string, boolean>;

function statusBadge(id: WalletAdapter['id'], available: boolean | undefined): React.ReactNode {
  if (id === 'lobstr') {
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Mobile
      </span>
    );
  }
  if (id === 'albedo') {
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
        Web
      </span>
    );
  }
  if (available === undefined) return null;
  return available ? (
    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      Installed
    </span>
  ) : (
    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      Not installed
    </span>
  );
}

const WalletModal: React.FC = () => {
  const { isModalOpen, closeModal, connect, disconnect, publicKey, isConnecting } = useWallet();
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    Promise.resolve().then(() => {
      setError(null);
    });

    Promise.all(
      WALLET_ADAPTERS.map(async (a) => {
        const available = await a.isAvailable();
        return [a.id, available] as const;
      }),
    ).then((entries) => {
      setAvailability(Object.fromEntries(entries));
    });
  }, [isModalOpen]);

  const handleConnect = async (adapter: WalletAdapter) => {
    setConnectingId(adapter.id);
    setError(null);
    try {
      await connect(adapter.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Connect Wallet"
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Network:</span>
          <NetworkBadge />
        </div>

        {publicKey && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 truncate">
              {publicKey}
            </span>
            <button
              onClick={disconnect}
              className="ml-2 text-xs text-red-500 hover:text-red-700 font-medium shrink-0"
            >
              Disconnect
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {WALLET_ADAPTERS.map((adapter) => {
            const loading = connectingId === adapter.id || (isConnecting && connectingId === adapter.id);
            return (
              <button
                key={adapter.id}
                onClick={() => handleConnect(adapter)}
                disabled={!!connectingId || isConnecting}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-background-elevated transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 rounded-lg bg-background-elevated flex items-center justify-center shrink-0">
                  <img src={adapter.icon} alt={adapter.name} className="w-5 h-5" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <span className="flex-1 font-medium text-text-primary">{adapter.name}</span>
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-primary" />
                ) : (
                  statusBadge(adapter.id, availability[adapter.id])
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default WalletModal;
