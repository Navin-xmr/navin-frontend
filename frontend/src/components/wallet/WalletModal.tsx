import React, { useEffect, useState } from 'react';
import { Loader2, Smartphone, Globe, CheckCircle, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useWallet } from '../../context/WalletContext';
import { WALLET_ADAPTERS } from '../../services/stellar/adapters';
import type { WalletAdapter } from '../../services/stellar/adapters/types';
import NetworkBadge from './NetworkBadge';

type AvailabilityMap = Record<string, boolean>;
type ErrorMap = Record<string, string>;

/** Converts raw SDK/browser errors into user-facing messages. */
function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes('user declined') || lower.includes('user rejected') || lower.includes('cancelled')) {
    return 'Connection cancelled. Please approve the request in your wallet.';
  }
  if (lower.includes('not installed') || lower.includes('not found') || lower.includes('undefined')) {
    return 'Wallet extension not detected. Install it and reload.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('timeout')) {
    return 'Network error. Check your connection and try again.';
  }
  if (lower.includes('locked') || lower.includes('unauthorized')) {
    return 'Wallet is locked. Unlock it and try again.';
  }
  // Trim overly long SDK messages
  return msg.length > 120 ? `${msg.slice(0, 117)}…` : msg;
}

function statusBadge(id: WalletAdapter['id'], available: boolean | undefined): React.ReactNode {
  if (id === 'lobstr') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        <Smartphone size={10} aria-hidden="true" />
        Mobile
      </span>
    );
  }
  if (id === 'albedo') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
        <Globe size={10} aria-hidden="true" />
        Web
      </span>
    );
  }
  if (available === undefined) return null;
  return available ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <CheckCircle size={10} aria-hidden="true" />
      Installed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      <HelpCircle size={10} aria-hidden="true" />
      Not installed
    </span>
  );
}

const WalletModal: React.FC = () => {
  const { isModalOpen, closeModal, connect, disconnect, publicKey, isConnecting } = useWallet();
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ErrorMap>({});

  useEffect(() => {
    if (!isModalOpen) return;
    setErrors({});

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
    // Clear any previous error for this adapter
    setErrors((prev) => {
      const next = { ...prev };
      delete next[adapter.id];
      return next;
    });
    setConnectingId(adapter.id);
    try {
      await connect(adapter.id);
    } catch (err) {
      setErrors((prev) => ({ ...prev, [adapter.id]: friendlyError(err) }));
    } finally {
      setConnectingId(null);
    }
  };

  const hasAnyError = Object.keys(errors).length > 0;

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
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle size={14} className="text-emerald-500 shrink-0" aria-hidden="true" />
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 truncate max-sm:text-[11px]">
                {publicKey}
              </span>
            </div>
            <button
              onClick={disconnect}
              className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0 self-end sm:self-auto min-h-[32px] px-2 focus-visible:outline-2 focus-visible:outline-red-400 rounded"
            >
              Disconnect
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2" role="list" aria-label="Available wallets">
          {WALLET_ADAPTERS.map((adapter) => {
            const isLoadingThis = connectingId === adapter.id;
            const isDisabled = !!connectingId || isConnecting;
            const adapterError = errors[adapter.id];
            const hasError = Boolean(adapterError);

            return (
              <div key={adapter.id} role="listitem">
                <button
                  onClick={() => handleConnect(adapter)}
                  disabled={isDisabled}
                  aria-describedby={hasError ? `wallet-error-${adapter.id}` : undefined}
                  aria-busy={isLoadingThis}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 sm:py-3 rounded-xl border transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] sm:min-h-[48px] focus-visible:outline-2 focus-visible:outline-primary ${
                    hasError
                      ? 'border-red-400 dark:border-red-500/60 bg-red-50/40 dark:bg-red-900/10 hover:border-red-500 dark:hover:border-red-400'
                      : 'border-border hover:border-primary hover:bg-background-elevated'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-background-elevated flex items-center justify-center shrink-0">
                    <img
                      src={adapter.icon}
                      alt=""
                      aria-hidden="true"
                      className="w-5 h-5"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <span className="flex-1 font-medium text-text-primary">{adapter.name}</span>
                  {isLoadingThis ? (
                    <Loader2 size={16} className="animate-spin text-primary" aria-hidden="true" />
                  ) : hasError ? (
                    <span className="inline-flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium shrink-0">
                      <RefreshCw size={12} aria-hidden="true" />
                      Retry
                    </span>
                  ) : (
                    statusBadge(adapter.id, availability[adapter.id])
                  )}
                </button>

                {hasError && (
                  <p
                    id={`wallet-error-${adapter.id}`}
                    role="alert"
                    className="mt-1.5 flex items-start gap-1.5 text-xs text-red-500 dark:text-red-400 px-1"
                  >
                    <AlertCircle size={12} className="shrink-0 mt-0.5" aria-hidden="true" />
                    {adapterError}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {hasAnyError && (
          <button
            type="button"
            onClick={() => setErrors({})}
            className="text-xs text-text-secondary hover:text-text-primary underline text-left transition-colors"
          >
            Clear all errors
          </button>
        )}

        <p className="text-xs text-text-secondary leading-relaxed m-0">
          By connecting, you agree to sign transactions on the{' '}
          <strong className="text-text-primary">Stellar</strong> network. Your
          keys never leave your wallet.
        </p>
      </div>
    </Modal>
  );
};

export default WalletModal;
