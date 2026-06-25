import type { WalletAdapter } from './types';

export class LobstrAdapter implements WalletAdapter {
  readonly id = 'lobstr' as const;
  readonly name = 'LOBSTR';
  readonly icon = '/images/wallets/lobstr.svg';

  private _publicKey: string | null = null;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async connect(): Promise<{ publicKey: string }> {
    // LOBSTR Vault uses WalletConnect — a QR code flow is required in
    // production. This placeholder surfaces the requirement; replace with a
    // real WalletConnect session when the WC SDK is integrated.
    throw new Error(
      'LOBSTR requires scanning a WalletConnect QR code. ' +
        'Full WalletConnect integration is required for mobile pairing.',
    );
  }

  async disconnect(): Promise<void> {
    this._publicKey = null;
  }

  async signTransaction(_xdr: string, _network: 'testnet' | 'mainnet'): Promise<string> {
    if (!this._publicKey) {
      throw new Error('LOBSTR: no active WalletConnect session');
    }
    throw new Error('LOBSTR: WalletConnect signing requires an active session');
  }

  async getPublicKey(): Promise<string> {
    if (!this._publicKey) {
      throw new Error('LOBSTR: wallet not connected');
    }
    return this._publicKey;
  }
}
