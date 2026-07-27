import type { WalletAdapter } from './types';

export class AlbedoAdapter implements WalletAdapter {
  readonly id = 'albedo' as const;
  readonly name = 'Albedo';
  readonly icon = '/images/wallets/albedo.svg';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async connect(): Promise<{ publicKey: string }> {
    const { default: albedo } = await import('@albedo-link/intent');
    const result = await albedo.publicKey({});
    return { publicKey: result.pubkey };
  }

  async disconnect(): Promise<void> {
    // Albedo is stateless; nothing to disconnect
  }

  async signTransaction(xdr: string, network: 'testnet' | 'mainnet'): Promise<string> {
    const { default: albedo } = await import('@albedo-link/intent');
    const result = await albedo.tx({ xdr, network });
    return result.signed_envelope_xdr;
  }

  async getPublicKey(): Promise<string> {
    const { default: albedo } = await import('@albedo-link/intent');
    const result = await albedo.publicKey({});
    return result.pubkey;
  }
}
