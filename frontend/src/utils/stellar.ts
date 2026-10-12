/**
 * Stellar network utilities shared across the app.
 *
 * The network is determined once from VITE_STELLAR_NETWORK at build time.
 * All explorer links use this value so testnet builds point to the correct
 * Stellar Expert explorer path instead of the mainnet "/public/" path.
 */

const STELLAR_NETWORK =
  (import.meta.env.VITE_STELLAR_NETWORK as 'testnet' | 'mainnet') ?? 'testnet';

/**
 * Maps the app's network name to Stellar Expert's URL segment.
 * Stellar Expert uses "public" for mainnet and "testnet" for testnet.
 */
const STELLAR_EXPERT_NETWORK = STELLAR_NETWORK === 'mainnet' ? 'public' : 'testnet';

/**
 * Returns the Stellar Expert explorer URL for a transaction hash,
 * using the network configured via VITE_STELLAR_NETWORK.
 *
 * @param hash - Stellar transaction hash
 * @returns Full explorer URL, or undefined if no hash is provided
 */
export function getStellarExpertTxUrl(hash: string): string;
export function getStellarExpertTxUrl(hash?: string): string | undefined;
export function getStellarExpertTxUrl(hash?: string): string | undefined {
  if (!hash) return undefined;
  return `https://stellar.expert/explorer/${STELLAR_EXPERT_NETWORK}/tx/${hash}`;
}

/**
 * The currently configured Stellar network ('testnet' | 'mainnet').
 * Exported for use in network mismatch warnings.
 */
export { STELLAR_NETWORK };
