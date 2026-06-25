import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { WalletAdapter } from '../services/stellar/adapters/types';
import { WALLET_ADAPTERS } from '../services/stellar/adapters';

const LAST_ADAPTER_KEY = 'navin-last-wallet';
const NETWORK = (import.meta.env.VITE_STELLAR_NETWORK as 'testnet' | 'mainnet') ?? 'testnet';

export interface WalletContextValue {
  adapter: WalletAdapter | null;
  publicKey: string | null;
  isConnecting: boolean;
  isModalOpen: boolean;
  network: 'testnet' | 'mainnet';
  lastAdapterId: string | null;
  openModal: () => void;
  closeModal: () => void;
  connect: (adapterId: WalletAdapter['id']) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adapter, setAdapter] = useState<WalletAdapter | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lastAdapterId = useMemo(() => localStorage.getItem(LAST_ADAPTER_KEY), [publicKey]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const connect = useCallback(async (adapterId: WalletAdapter['id']) => {
    const found = WALLET_ADAPTERS.find((a) => a.id === adapterId);
    if (!found) throw new Error(`Unknown adapter: ${adapterId}`);

    setIsConnecting(true);
    try {
      const { publicKey: pk } = await found.connect();
      setAdapter(found);
      setPublicKey(pk);
      localStorage.setItem(LAST_ADAPTER_KEY, adapterId);
      setIsModalOpen(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (adapter) await adapter.disconnect();
    setAdapter(null);
    setPublicKey(null);
    localStorage.removeItem(LAST_ADAPTER_KEY);
  }, [adapter]);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!adapter) throw new Error('No wallet connected');
      return adapter.signTransaction(xdr, NETWORK);
    },
    [adapter],
  );

  // Restore last adapter ID so the UI can prompt reconnection
  useEffect(() => {
    // intentionally not auto-connecting — user must confirm
  }, []);

  const value: WalletContextValue = useMemo(
    () => ({
      adapter,
      publicKey,
      isConnecting,
      isModalOpen,
      network: NETWORK,
      lastAdapterId,
      openModal,
      closeModal,
      connect,
      disconnect,
      signTransaction,
    }),
    [adapter, publicKey, isConnecting, isModalOpen, lastAdapterId, openModal, closeModal, connect, disconnect, signTransaction],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
