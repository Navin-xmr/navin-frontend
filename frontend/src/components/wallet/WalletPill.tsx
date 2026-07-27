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
        className="flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-sm font-semibold bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all hover:-translate-y-px min-h-[44px] sm:min-h-[40px] focus-visible:outline-2 focus-visible:outline-emerald-400"
        aria-label="Connect wallet"
      >
        <Wallet size={16} className="shrink-0" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 min-h-[44px] sm:min-h-[40px] focus-visible:outline-2 focus-visible:outline-emerald-400"
        aria-label={`Wallet connected: ${publicKey}`}
      >
        <Wallet size={16} className="shrink-0 text-emerald-500" />
        <span className="font-mono hidden sm:inline">{truncate(publicKey)}</span>
      </button>
      <button
        onClick={disconnect}
        className="flex items-center justify-center p-2.5 sm:p-2 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 transition-all min-h-[44px] sm:min-h-[40px] min-w-[44px] sm:min-w-[40px] focus-visible:outline-2 focus-visible:outline-red-400"
        aria-label="Disconnect wallet"
        title="Disconnect wallet"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
};

export default WalletPill;
