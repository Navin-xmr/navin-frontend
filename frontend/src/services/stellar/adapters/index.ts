export type { WalletAdapter } from './types';
export { FreighterAdapter } from './FreighterAdapter';
export { AlbedoAdapter } from './AlbedoAdapter';
export { LobstrAdapter } from './LobstrAdapter';

import { FreighterAdapter } from './FreighterAdapter';
import { AlbedoAdapter } from './AlbedoAdapter';
import { LobstrAdapter } from './LobstrAdapter';
import type { WalletAdapter } from './types';

export const WALLET_ADAPTERS: WalletAdapter[] = [
  new FreighterAdapter(),
  new AlbedoAdapter(),
  new LobstrAdapter(),
];
