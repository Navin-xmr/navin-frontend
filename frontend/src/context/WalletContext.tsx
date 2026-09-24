import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { WalletAdapter } from '../services/stellar/adapters/types';
import { WALLET_ADAPTERS } from '../services/stellar/adapters';

const LAST_ADAPTER_KEY = 'navin-last-wallet';
const PUBLIC_KEY_KEY = 'navin-wallet-public-key';
const NETWORK = (import.meta.env.VITE_STELLAR_NETWORK as 'testnet' | 'mainnet') ?? 'testnet';
const STELLAR_PUBLIC_KEY_PATTERN = /^G[A-Z2-7]{55}$/;

/** How often (ms) to poll the wallet extension for account/network changes. */
const POLL_INTERVAL_MS = 4_000;

export interface WalletContextValue {
  adapter: WalletAdapter | null;
  publicKey: string | null;
  isConnecting: boolean;
  isModalOpen: boolean;
  network: 'testnet' | 'mainnet';
  lastAdapterId: string | null;
  /**
   * True when the wallet extension is connected to a different network than
   * the one configured via VITE_STELLAR_NETWORK. Signing is blocked while
   * this flag is set.
   */
  networkMismatch: boolean;
  openModal: () => void;
  closeModal: () => void;
  connect: (adapterId: WalletAdapter['id']) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

function isValidPublicKey(publicKey: string): boolean {
  return STELLAR_PUBLIC_KEY_PATTERN.test(publicKey);
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adapter, setAdapter] = useState<WalletAdapter | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(() => {
    const storedPublicKey = localStorage.getItem(PUBLIC_KEY_KEY);
    return storedPublicKey && isValidPublicKey(storedPublicKey) ? storedPublicKey : null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [networkMismatch, setNetworkMismatch] = useState(false);

  const lastAdapterId = useMemo(() => localStorage.getItem(LAST_ADAPTER_KEY), []);

  // Keep a ref to the adapter so the polling interval always sees the latest
  // value without being re-created every time adapter state changes.
  const adapterRef = useRef<WalletAdapter | null>(null);
  adapterRef.current = adapter;

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const connect = useCallback(async (adapterId: WalletAdapter['id']) => {
    const found = WALLET_ADAPTERS.find((a) => a.id === adapterId);
    if (!found) throw new Error(`Unknown adapter: ${adapterId}`);

    setIsConnecting(true);
    try {
      const { publicKey: pk } = await found.connect();
      if (!isValidPublicKey(pk)) {
        throw new Error('Invalid Stellar public key');
      }
      setAdapter(found);
      setPublicKey(pk);
      localStorage.setItem(LAST_ADAPTER_KEY, adapterId);
      localStorage.setItem(PUBLIC_KEY_KEY, pk);
      setIsModalOpen(false);
      setNetworkMismatch(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (adapterRef.current) await adapterRef.current.disconnect();
    setAdapter(null);
    setPublicKey(null);
    setNetworkMismatch(false);
    localStorage.removeItem(LAST_ADAPTER_KEY);
    localStorage.removeItem(PUBLIC_KEY_KEY);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!adapter) throw new Error('No wallet connected');
      if (networkMismatch) {
        throw new Error(
          `Network mismatch: your wallet is connected to a different network than this app (${NETWORK}). Please switch your wallet to the correct network before signing.`,
        );
      }
      return adapter.signTransaction(xdr, NETWORK);
    },
    [adapter, networkMismatch],
  );

  // Poll the wallet extension while a wallet is connected and the window is
  // focused. Detects account switches and network switches in Freighter.
  useEffect(() => {
    const poll = async () => {
      const currentAdapter = adapterRef.current;
      if (!currentAdapter) return;

      try {
        // Check for account change
        const latestKey = await currentAdapter.getPublicKey();
        if (isValidPublicKey(latestKey)) {
          setPublicKey((prev) => {
            if (prev !== latestKey) {
              localStorage.setItem(PUBLIC_KEY_KEY, latestKey);
            }
            return latestKey;
          });
        }

        // Check for network change (only adapters that support it, e.g. Freighter)
        if (typeof currentAdapter.getNetwork === 'function') {
          const walletNetwork = await currentAdapter.getNetwork();
          setNetworkMismatch(walletNetwork !== NETWORK);
        }
      } catch {
        // Extension may be locked / unavailable — leave state as-is
      }
    };

    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void poll();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

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
      networkMismatch,
      openModal,
      closeModal,
      connect,
      disconnect,
      signTransaction,
    }),
    [adapter, publicKey, isConnecting, isModalOpen, lastAdapterId, networkMismatch, openModal, closeModal, connect, disconnect, signTransaction],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
