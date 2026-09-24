const VALID_NETWORKS = ['testnet', 'mainnet'] as const;
export type StellarNetwork = typeof VALID_NETWORKS[number];

// Literal passphrases (same values as the SDK's Networks enum) so this module,
// which the app shell imports, doesn't pull @stellar/stellar-sdk into the entry chunk.
export const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  testnet: 'Test SDF Network ; September 2015',
  mainnet: 'Public Global Stellar Network ; September 2015',
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
