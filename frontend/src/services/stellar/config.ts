import { Networks } from '@stellar/stellar-sdk';

const VALID_NETWORKS = ['testnet', 'mainnet'] as const;
export type StellarNetwork = typeof VALID_NETWORKS[number];

export const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  testnet: Networks.TESTNET_NETWORK_PASSPHRASE,
  mainnet: Networks.PUBLIC_NETWORK_PASSPHRASE,
};

export function validateNetwork(value: string | undefined): StellarNetwork {
  if (!value || !VALID_NETWORKS.includes(value as StellarNetwork)) {
    const isDev = import.meta.env.DEV;
    const fallback = 'testnet' as const;

    if (isDev) {
      throw new Error(
        `Invalid VITE_STELLAR_NETWORK: "${value}". Must be one of: ${VALID_NETWORKS.join(', ')}`
      );
    }

    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(
        new Error(`Invalid VITE_STELLAR_NETWORK: "${value}". Using fallback: ${fallback}`)
      );
    }

    return fallback;
  }

  return value as StellarNetwork;
}

export function getNetworkPassphrase(network: StellarNetwork): string {
  return NETWORK_PASSPHRASES[network];
}

declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error) => void;
    };
  }
}
