import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction as freighterSign,
} from '@stellar/freighter-api';
import type { WalletAdapter } from './types';

export class FreighterAdapter implements WalletAdapter {
  readonly id = 'freighter' as const;
  readonly name = 'Freighter';
  readonly icon = '/images/wallets/freighter.svg';

  async isAvailable(): Promise<boolean> {
    try {
      const result = await isConnected();
      return result.isConnected;
    } catch {
      return false;
    }
  }

  async connect(): Promise<{ publicKey: string }> {
    const access = await requestAccess();
    if (!access.address) {
      throw new Error('Freighter: access denied');
    }
    return { publicKey: access.address };
  }

  async disconnect(): Promise<void> {
    // Freighter does not support programmatic disconnection
  }

  async signTransaction(xdr: string, network: 'testnet' | 'mainnet'): Promise<string> {
    const networkPassphrase =
      network === 'mainnet'
        ? 'Public Global Stellar Network ; September 2015'
        : 'Test SDF Network ; September 2015';

    const result = await freighterSign(xdr, { networkPassphrase });
    if (!result.signedTxXdr) {
      throw new Error('Freighter: signing failed');
    }
    return result.signedTxXdr;
  }

  async getPublicKey(): Promise<string> {
    const result = await getAddress();
    if (!result.address) {
      throw new Error('Freighter: no public key available');
    }
    return result.address;
  }
}
