/**
 * Soroban contract service.
 *
 * Wraps one-shot Soroban contract calls with exponential-backoff retry logic
 * for transient network failures, while never retrying validation errors or
 * re-submitting a transaction that has already been broadcast.
 */

import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
} from '@stellar/stellar-sdk';

const RPC_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as { env?: Record<string, string> }).env?.VITE_SOROBAN_RPC_URL) ||
  'https://soroban-testnet.stellar.org';

const NETWORK_PASSPHRASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta as { env?: Record<string, string> }).env?.VITE_STELLAR_NETWORK_PASSPHRASE) ||
  Networks.TESTNET;

/** Retry delays in ms: 500ms -> 1000ms -> 2000ms (3 retries). */
export const RETRY_DELAYS_MS = [500, 1000, 2000] as const;

/** Callback invoked before each retry attempt so the UI can show progress. */
export type RetryListener = (attempt: number, total: number) => void;

export interface ContractCallOptions {
  /** Optional listener for retry feedback, e.g. "Retrying... (2 of 3)". */
  onRetry?: RetryListener;
  /** Optional pre-built transaction hash to guard against double submission. */
  txHash?: string;
}

/**
 * Tracks transaction hashes that have already been submitted so we never
 * broadcast the same transaction twice (prevents double-spending).
 */
const submittedTxHashes = new Set<string>();

/** Errors that indicate a transient network/RPC problem worth retrying. */
const NETWORK_ERROR_PATTERNS = [
  'timeout',
  'timed out',
  'econnrefused',
  'econnreset',
  'enotfound',
  'etimedout',
  'network',
  'fetch failed',
  'socket hang up',
  'service unavailable',
  'temporarily unavailable',
  '503',
  '502',
  '504',
];

/**
 * Returns true only for transient network/RPC failures. Validation errors,
 * contract errors, and other deterministic failures are never retried.
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const code = (error as { code?: string }).code;
  if (code && ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(code)) {
    return true;
  }

  const message = String((error as { message?: string }).message ?? error).toLowerCase();
  return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs `operation` with exponential backoff, retrying only transient network
 * errors. `onRetry` is called before each retry with the attempt number.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  onRetry?: RetryListener,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === RETRY_DELAYS_MS.length;
      if (isLastAttempt || !isRetryableError(error)) {
        throw error;
      }

      const retryNumber = attempt + 1;
      onRetry?.(retryNumber, RETRY_DELAYS_MS.length);
      await delay(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}

/**
 * Invokes a read-only Soroban contract method with retry on transient errors.
 */
export async function callContract(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
  options: ContractCallOptions = {},
): Promise<xdr.ScVal> {
  const server = new SorobanRpc.Server(RPC_URL);
  const contract = new Contract(contractId);

  return withRetry(async () => {
    const account = await server.getAccount(contractId);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const simulated = await server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(simulated)) {
      // Simulation/validation failures are deterministic: do not retry.
      throw new Error(simulated.error);
    }

    return (simulated as SorobanRpc.Api.SimulateTransactionSuccessResponse).result!.retval;
  }, options.onRetry);
}

/**
 * Submits a signed transaction, retrying only transient network failures.
 * The transaction hash is tracked so the same tx is never submitted twice.
 */
export async function submitTransaction(
  signedTxXdr: string,
  options: ContractCallOptions = {},
): Promise<SorobanRpc.Api.GetTransactionResponse> {
  const server = new SorobanRpc.Server(RPC_URL);
  const tx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const txHash = options.txHash ?? tx.hash().toString('hex');

  if (submittedTxHashes.has(txHash)) {
    throw new Error(`Transaction ${txHash} has already been submitted.`);
  }

  return withRetry(async () => {
    const response = await server.sendTransaction(tx);

    if (response.status === 'ERROR') {
      // Deterministic submission error: do not retry.
      throw new Error(`Transaction submission failed: ${JSON.stringify(response.errorResult)}`);
    }

    // Mark as submitted only once the node accepted the transaction.
    submittedTxHashes.add(txHash);
    return response;
  }, options.onRetry);
}

/** Test/utility helper to clear the in-memory submitted-tx guard. */
export function resetSubmittedTxHashes(): void {
  submittedTxHashes.clear();
}
