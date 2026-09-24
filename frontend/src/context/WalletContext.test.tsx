import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletAdapter } from '../services/stellar/adapters/types';
import { WalletProvider, useWallet } from './WalletContext';

const VALID_PUBLIC_KEY = `G${'A'.repeat(55)}`;
const PUBLIC_KEY_KEY = 'navin-wallet-public-key';
const LAST_ADAPTER_KEY = 'navin-last-wallet';

const { mockConnect, mockDisconnect } = vi.hoisted(() => ({
  mockConnect: vi.fn<() => Promise<{ publicKey: string }>>(),
  mockDisconnect: vi.fn<() => Promise<void>>(),
}));

vi.mock('../services/stellar/adapters', () => {
  const adapter: WalletAdapter = {
    id: 'freighter',
    name: 'Freighter',
    icon: 'freighter',
    isAvailable: vi.fn(async () => true),
    connect: mockConnect,
    disconnect: mockDisconnect,
    signTransaction: vi.fn(async (xdr: string) => xdr),
    getPublicKey: vi.fn(async () => VALID_PUBLIC_KEY),
  };

  return {
    WALLET_ADAPTERS: [adapter],
  };
});

function wrapper({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}

describe('WalletContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    mockConnect.mockResolvedValue({ publicKey: VALID_PUBLIC_KEY });
    mockDisconnect.mockResolvedValue();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts disconnected with no public key', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.isConnecting).toBe(false);
    expect(result.current.publicKey).toBeNull();
    expect(result.current.adapter).toBeNull();
  });

  it('connects a wallet with a valid public key', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('freighter');
    });

    expect(result.current.publicKey).toBe(VALID_PUBLIC_KEY);
    expect(result.current.adapter?.id).toBe('freighter');
    expect(localStorage.getItem(PUBLIC_KEY_KEY)).toBe(VALID_PUBLIC_KEY);
  });

  it('disconnects a connected wallet and resets state', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('freighter');
      await result.current.disconnect();
    });

    expect(result.current.publicKey).toBeNull();
    expect(result.current.adapter).toBeNull();
    expect(localStorage.getItem(PUBLIC_KEY_KEY)).toBeNull();
    expect(localStorage.getItem(LAST_ADAPTER_KEY)).toBeNull();
  });

  it('hydrates a persisted public key on mount', () => {
    localStorage.setItem(PUBLIC_KEY_KEY, VALID_PUBLIC_KEY);

    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.publicKey).toBe(VALID_PUBLIC_KEY);
  });

  it('throws when used outside WalletProvider', () => {
    expect(() => renderHook(() => useWallet())).toThrow(
      'useWallet must be used within WalletProvider',
    );
  });

  it('rejects invalid public keys and remains disconnected', async () => {
    mockConnect.mockResolvedValue({ publicKey: 'invalid-public-key' });
    const { result } = renderHook(() => useWallet(), { wrapper });

    await expect(
      act(async () => {
        await result.current.connect('freighter');
      }),
    ).rejects.toThrow('Invalid Stellar public key');

    expect(result.current.publicKey).toBeNull();
    expect(result.current.adapter).toBeNull();
    expect(localStorage.getItem(PUBLIC_KEY_KEY)).toBeNull();
  });
});
