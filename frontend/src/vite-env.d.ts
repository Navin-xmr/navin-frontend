/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_STELLAR_NETWORK: 'testnet' | 'mainnet';
  readonly VITE_SOROBAN_RPC_URL?: string;
  readonly VITE_ESCROW_CONTRACT_ID: string;
  readonly VITE_DISABLE_REALTIME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
