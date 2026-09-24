import { describe, expect, it, vi, afterEach } from 'vitest';

// We use vi.stubEnv to set VITE_STELLAR_NETWORK before importing the module.
// Because the module reads the env at module-evaluation time we must re-import
// it after each stub via vi.resetModules().

describe('getStellarExpertTxUrl — #883', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns a testnet explorer URL when VITE_STELLAR_NETWORK=testnet', async () => {
    vi.stubEnv('VITE_STELLAR_NETWORK', 'testnet');
    const { getStellarExpertTxUrl } = await import('./stellar');
    expect(getStellarExpertTxUrl('abc123')).toBe(
      'https://stellar.expert/explorer/testnet/tx/abc123',
    );
  });

  it('returns a mainnet explorer URL when VITE_STELLAR_NETWORK=mainnet', async () => {
    vi.stubEnv('VITE_STELLAR_NETWORK', 'mainnet');
    const { getStellarExpertTxUrl } = await import('./stellar');
    expect(getStellarExpertTxUrl('abc123')).toBe(
      'https://stellar.expert/explorer/public/tx/abc123',
    );
  });

  it('returns undefined when no hash is provided', async () => {
    vi.stubEnv('VITE_STELLAR_NETWORK', 'testnet');
    const { getStellarExpertTxUrl } = await import('./stellar');
    expect(getStellarExpertTxUrl(undefined)).toBeUndefined();
  });

  it('defaults to testnet when VITE_STELLAR_NETWORK is not set', async () => {
    vi.stubEnv('VITE_STELLAR_NETWORK', '');
    const { getStellarExpertTxUrl } = await import('./stellar');
    // Empty string is falsy — module falls back to 'testnet'
    expect(getStellarExpertTxUrl('abc123')).toBe(
      'https://stellar.expert/explorer/testnet/tx/abc123',
    );
  });
});
