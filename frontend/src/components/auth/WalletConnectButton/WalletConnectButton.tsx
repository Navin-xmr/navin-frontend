import React, { useEffect, useRef } from 'react';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useWallet } from '../../../context/WalletContext';

export interface WalletConnectButtonProps {
  className?: string;
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

function truncateAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  className = '',
  onConnect,
  onDisconnect,
}) => {
  const { publicKey, isConnecting, openModal, disconnect } = useWallet();
  const prevPublicKey = useRef<string | null>(publicKey);

  // Notify parents when the underlying wallet state changes, regardless of
  // whether the connection happened via this button or the navbar picker.
  useEffect(() => {
    if (publicKey && publicKey !== prevPublicKey.current) {
      onConnect?.(publicKey);
    } else if (!publicKey && prevPublicKey.current) {
      onDisconnect?.();
    }
    prevPublicKey.current = publicKey;
  }, [publicKey, onConnect, onDisconnect]);

  const handleDisconnect = () => {
    void disconnect();
  };

  if (publicKey) {
    return (
      <div className={`flex items-center gap-2 font-sans ${className}`}>
        <button
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[0.95rem] font-semibold cursor-default transition-all border border-gray-200 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          disabled
        >
          <Wallet size={18} className="shrink-0" />
          <span className="font-mono tracking-wide">{truncateAddress(publicKey)}</span>
        </button>
        <button
          className="flex items-center justify-center p-2.5 rounded-xl cursor-pointer transition-all border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 hover:-translate-y-px active:translate-y-px dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20"
          onClick={handleDisconnect}
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
        >
          <LogOut size={16} className="shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <button
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_6px_-1px_rgba(16,185,129,0.2),0_2px_4px_-1px_rgba(16,185,129,0.1)] hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-px hover:shadow-[0_6px_8px_-1px_rgba(16,185,129,0.3)] active:translate-y-px disabled:cursor-default disabled:opacity-70 ${className}`}
      onClick={openModal}
      disabled={isConnecting}
    >
      {isConnecting ? <Loader2 size={18} className="shrink-0 animate-spin" /> : <Wallet size={18} className="shrink-0" />}
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
};
