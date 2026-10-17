import { createContext, useContext } from 'react';
import type { WalletAdapter } from '../services/stellar/adapters/types';

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

export const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
