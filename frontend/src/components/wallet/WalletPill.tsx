import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

function truncate(key: string): string {
  return `${key.slice(0, 5)}…${key.slice(-4)}`;
}

const WalletPill: React.FC = () => {
  const { publicKey, disconnect, openModal } = useWallet();

  if (!publicKey) {
    return (
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all hover:-translate-y-px"
        aria-label="Connect wallet"
      >
        <Wallet size={16} />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-default"
        aria-label={`Wallet connected: ${publicKey}`}
      >
        <Wallet size={16} className="shrink-0 text-emerald-500" />
        <span className="font-mono">{truncate(publicKey)}</span>
      </button>
      <button
        onClick={disconnect}
        className="flex items-center justify-center p-2 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 transition-all"
        aria-label="Disconnect wallet"
        title="Disconnect wallet"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
};

export default WalletPill;
