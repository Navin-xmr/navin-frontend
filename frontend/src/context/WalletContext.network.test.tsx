/**
 * Tests for #882 — Freighter account/network polling
 * and #881 — wallet cleared on logout (disconnect clears localStorage).
 */
import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletAdapter } from '../services/stellar/adapters/types';
import { WalletProvider, useWallet } from './WalletContext';

const VALID_PUBLIC_KEY = `G${'A'.repeat(55)}`;
const ALT_PUBLIC_KEY = `G${'B'.repeat(55)}`;
const PUBLIC_KEY_KEY = 'navin-wallet-public-key';
const LAST_ADAPTER_KEY = 'navin-last-wallet';

const {
  mockConnect,
  mockDisconnect,
  mockGetPublicKey,
  mockGetNetwork,
} = vi.hoisted(() => ({
  mockConnect: vi.fn<() => Promise<{ publicKey: string }>>(),
  mockDisconnect: vi.fn<() => Promise<void>>(),
  mockGetPublicKey: vi.fn<() => Promise<string>>(),
  mockGetNetwork: vi.fn<() => Promise<'testnet' | 'mainnet'>>(),
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
    getPublicKey: mockGetPublicKey,
    getNetwork: mockGetNetwork,
  };
  return { WALLET_ADAPTERS: [adapter] };
});

function wrapper({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}

describe('WalletContext — #881 wallet cleared on logout', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    mockConnect.mockResolvedValue({ publicKey: VALID_PUBLIC_KEY });
    mockDisconnect.mockResolvedValue();
    mockGetPublicKey.mockResolvedValue(VALID_PUBLIC_KEY);
    mockGetNetwork.mockResolvedValue('testnet');
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('disconnect() removes both localStorage keys', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('freighter');
    });

    expect(localStorage.getItem(PUBLIC_KEY_KEY)).toBe(VALID_PUBLIC_KEY);
    expect(localStorage.getItem(LAST_ADAPTER_KEY)).toBe('freighter');

    await act(async () => {
      await result.current.disconnect();
    });

    expect(localStorage.getItem(PUBLIC_KEY_KEY)).toBeNull();
    expect(localStorage.getItem(LAST_ADAPTER_KEY)).toBeNull();
    expect(result.current.publicKey).toBeNull();
    expect(result.current.adapter).toBeNull();
  });

  it('disconnect() clears the networkMismatch flag', async () => {
    mockGetNetwork.mockResolvedValue('mainnet'); // mismatch against testnet default
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('freighter');
    });

    // Advance the poll interval so the mismatch is detected
    await act(async () => {
      vi.advanceTimersByTime(4_000);
      await Promise.resolve();
    });

    expect(result.current.networkMismatch).toBe(true);

    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.networkMismatch).toBe(false);
  });
});

describe('WalletContext — #882 account and network polling', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    mockConnect.mockResolvedValue({ publicKey: VALID_PUBLIC_KEY });
    mockDisconnect.mockResolvedValue();
    mockGetPublicKey.mockResolvedValue(VALID_PUBLIC_KEY);
    mockGetNetwork.mockResolvedValue('testnet');
    // Make the document visible so the poll fires
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('updates publicKey when the wallet account changes', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('freighter');
    });

    expect(result.current.publicKey).toBe(VALID_PUBLIC_KEY);

    // Simulate the user switching accounts in Freighter
    mockGetPublicKey.mockResolvedValue(ALT_PUBLIC_KEY);

    await act(async () => {
      vi.advanceTimersByTime(4_000);
      await Promise.resolve();
    });

    expect(result.current.publicKey).toBe(ALT_PUBLIC_KEY);
    expect(localStorage.getItem(PUBLIC_KEY_KEY)).toBe(ALT_PUBLIC_KEY);
  });

  it('sets networkMismatch=true when wallet network differs from app network', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('freighter');
    });

    expect(result.current.networkMismatch).toBe(false);

    // Simulate user switching Freighter to mainnet while app is testnet
    mockGetNetwork.mockResolvedValue('mainnet');

    await act(async () => {
      vi.advanceTimersByTime(4_000);
      await Promise.resolve();
    });

    expect(result.current.networkMismatch).toBe(true);
  });

  it('blocks signTransaction when networkMismatch is true', async () => {
    mockGetNetwork.mockResolvedValue('mainnet');
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('freighter');
      vi.advanceTimersByTime(4_000);
      await Promise.resolve();
    });

    expect(result.current.networkMismatch).toBe(true);

    await expect(
      result.current.signTransaction('test-xdr'),
    ).rejects.toThrow(/network mismatch/i);
  });

  it('resolves networkMismatch when wallet switches back to matching network', async () => {
    mockGetNetwork.mockResolvedValue('mainnet');
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('freighter');
      vi.advanceTimersByTime(4_000);
      await Promise.resolve();
    });

    expect(result.current.networkMismatch).toBe(true);

    mockGetNetwork.mockResolvedValue('testnet');

    await act(async () => {
      vi.advanceTimersByTime(4_000);
      await Promise.resolve();
    });

    expect(result.current.networkMismatch).toBe(false);
  });
});
