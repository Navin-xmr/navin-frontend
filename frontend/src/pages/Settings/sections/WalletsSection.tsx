import React, { useEffect, useState } from 'react';
import { Trash2, Wallet } from 'lucide-react';
import { apiClient } from '@services/api/client';
import { WalletConnectButton } from '../../../components/auth/WalletConnectButton/WalletConnectButton';

interface WalletEntry {
  publicKey: string;
  label: string;
  connectedAt: string;
}

const WalletsSection: React.FC = () => {
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data: WalletEntry[] }>('/api/users/me/wallets')
      .then((r) => setWallets(r.data.data))
      .catch(() => setWallets([]))
      .finally(() => setIsLoading(false));
  }, []);

  const removeWallet = async (publicKey: string) => {
    setRemoving(publicKey);
    try {
      await apiClient.delete(`/api/users/me/wallets/${publicKey}`);
      setWallets((prev) => prev.filter((w) => w.publicKey !== publicKey));
    } finally {
      setRemoving(null);
    }
  };

  const shortKey = (k: string) => `${k.slice(0, 6)}…${k.slice(-4)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet size={18} className="text-[#62ffff]" />
        <h2 className="text-lg font-semibold">Connected Wallets</h2>
      </div>

      {wallets.length === 0 && !isLoading && (
        <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg text-sm text-yellow-300">
          No wallet connected. Connect a wallet to manage settlements.
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading wallets…</p>
      ) : (
        <ul className="space-y-2">
          {wallets.map((w) => (
            <li key={w.publicKey} className="flex items-center justify-between bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.1)] rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-mono font-medium">{shortKey(w.publicKey)}</p>
                <p className="text-xs text-slate-400">{w.label} · Connected {new Date(w.connectedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => void removeWallet(w.publicKey)}
                disabled={removing === w.publicKey}
                className="text-red-400 hover:text-red-300 disabled:opacity-50"
                aria-label="Remove wallet"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <WalletConnectButton />
    </div>
  );
};

export default WalletsSection;
