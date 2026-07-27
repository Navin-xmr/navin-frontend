export interface WalletAdapter {
  id: 'freighter' | 'albedo' | 'lobstr';
  name: string;
  icon: string;
  isAvailable(): Promise<boolean>;
  connect(): Promise<{ publicKey: string }>;
  disconnect(): Promise<void>;
  signTransaction(xdr: string, network: 'testnet' | 'mainnet'): Promise<string>;
  getPublicKey(): Promise<string>;
}
