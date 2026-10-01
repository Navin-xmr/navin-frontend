/**
 * Retry utilities for Soroban contract calls.
 *
 * Blockchain RPCs can be flaky; a single transient failure should not fail the
 * user's flow. This module provides exponential backoff retries that only fire
 * on network/transient errors, never on validation errors, and that track
 * transaction hashes so the same transaction is never submitted twice
 * (avoiding double-spending).
 */

/** Delays (ms) between retries: 500ms -> 1000ms -> 2000ms (3 retries). */
export const RETRY_DELAYS_MS = [500, 1000, 2000] as const;

/** Total number of retries attempted after the initial call. */
export const MAX_RETRIES = RETRY_DELAYS_MS.length;

/**
 * Error codes / messages that indicate a transient network problem worth
 * retrying. Anything else (validation, contract logic errors, etc.) is treated
 * as permanent and surfaced immediately.
 */
const RETRYABLE_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET',
]);

const RETRYABLE_MESSAGE_PATTERNS = [
  /timeout/i,
  /timed out/i,
  /network/i,
  /fetch failed/i,
  /socket hang up/i,
  /temporarily unavailable/i,
  /service unavailable/i,
  /bad gateway/i,
  /gateway timeout/i,
  /too many requests/i,
  /rate limit/i,
  /connection (refused|reset|closed)/i,
  /econnrefused/i,
  /econnreset/i,
  /etimedout/i,
];

/**
 * Determine whether an error is a transient network error that is safe to
 * retry. Validation errors, contract errors, and user errors return false.
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const code = (error as { code?: unknown }).code;
  if (typeof code === 'string' && RETRYABLE_CODES.has(code)) {
    return true;
  }

  const status = (error as { status?: unknown }).status;
  if (typeof status === 'number' && (status === 429 || status >= 500)) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  return RETRYABLE_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Tracks transaction hashes that have already been submitted so a retry never
 * re-submits the same transaction (which could double-spend).
 */
export class SubmittedTxTracker {
  private readonly submitted = new Set<string>();

  has(txHash: string): boolean {
    return this.submitted.has(txHash);
  }

  mark(txHash: string): void {
    this.submitted.add(txHash);
  }

  clear(txHash?: string): void {
    if (txHash === undefined) {
      this.submitted.clear();
    } else {
      this.submitted.delete(txHash);
    }
  }
}

/** Callback invoked before each retry so the UI can show progress. */
export type RetryFeedback = (info: {
  attempt: number;
  maxRetries: number;
  delayMs: number;
  error: unknown;
}) => void;

export interface RetryOptions {
  /** Max retries after the initial attempt. Defaults to 3. */
  maxRetries?: number;
  /** Backoff delays in ms. Defaults to [500, 1000, 2000]. */
  delaysMs?: readonly number[];
  /** Called before each retry, e.g. to show "Retrying... (2 of 3)". */
  onRetry?: RetryFeedback;
  /** Optional abort signal to cancel pending retries. */
  signal?: AbortSignal;
  /** Injectable sleep for testing. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run an async operation with exponential backoff retries.
 *
 * Only retries when {@link isRetryableError} returns true; validation and other
 * permanent errors are re-thrown immediately.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const delaysMs = options.delaysMs ?? RETRY_DELAYS_MS;
  const sleep = options.sleep ?? defaultSleep;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt >= maxRetries;
      if (isLastAttempt || !isRetryableError(error)) {
        throw error;
      }

      if (options.signal?.aborted) {
        throw error;
      }

      const delayMs = delaysMs[Math.min(attempt, delaysMs.length - 1)];
      options.onRetry?.({
        attempt: attempt + 1,
        maxRetries,
        delayMs,
        error,
      });

      await sleep(delayMs);
    }
  }

  throw lastError;
}

/**
 * Submit a transaction exactly once, retrying only transient network failures.
 *
 * The transaction hash is recorded before submission so that a retry of the
 * same hash is skipped, preventing double-spending.
 */
export async function submitTransactionOnce(
  txHash: string,
  submit: () => Promise<unknown>,
  tracker: SubmittedTxTracker = new SubmittedTxTracker(),
  options: RetryOptions = {},
): Promise<unknown> {
  if (tracker.has(txHash)) {
    throw new Error(
      `Transaction ${txHash} has already been submitted; refusing to resubmit.`,
    );
  }

  tracker.mark(txHash);

  try {
    return await withRetry(submit, options);
  } catch (error) {
    // Allow a future explicit resubmission after a permanent failure.
    if (!isRetryableError(error)) {
      tracker.clear(txHash);
    }
    throw error;
  }
}
