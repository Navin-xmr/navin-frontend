import {
  Account,
  Networks,
  StrKey,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import type { Operation, Transaction } from '@stellar/stellar-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockServer, ServerCtor } = vi.hoisted(() => {
  const mockServer = {
    getAccount: vi.fn(),
    prepareTransaction: vi.fn(),
    sendTransaction: vi.fn(),
    getTransaction: vi.fn(),
    simulateTransaction: vi.fn(),
  };
  const ServerCtor = vi.fn(function () {
    return mockServer;
  });
  return { mockServer, ServerCtor };
});

vi.mock('@stellar/stellar-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stellar/stellar-sdk')>();
  // jsdom's cross-realm Uint8Array breaks ed25519 key generation, so the
  // throwaway simulation account gets a fixed public key instead.
  class MockKeypair extends actual.Keypair {
    static random() {
      return actual.Keypair.fromPublicKey(actual.StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 2)));
    }
  }
  return { ...actual, Keypair: MockKeypair, rpc: { ...actual.rpc, Server: ServerCtor } };
});

const CONTRACT_ID = StrKey.encodeContract(Buffer.alloc(32, 1));
const SIGNER_KEY = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 3));

async function loadClient(network = 'testnet') {
  vi.stubEnv('VITE_STELLAR_NETWORK', network);
  vi.stubEnv('VITE_SOROBAN_RPC_URL', 'https://rpc.example.test');
  return import('./client');
}

function makeSigner() {
  return {
    publicKey: SIGNER_KEY,
    signTransaction: vi.fn(async (txXdr: string) => txXdr),
  };
}

function invokedCall(tx: Transaction) {
  const op = tx.operations[0] as Operation.InvokeHostFunction;
  const call = op.func.invokeContract();
  return { method: call.functionName().toString(), args: call.args() };
}

describe('soroban client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockServer.getAccount.mockImplementation(async (key: string) => new Account(key, '1'));
    mockServer.prepareTransaction.mockImplementation(async (tx: Transaction) => tx);
    mockServer.sendTransaction.mockResolvedValue({ status: 'PENDING', hash: 'tx-hash' });
    mockServer.getTransaction.mockResolvedValue({ status: 'SUCCESS' });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe('callContractMethod', () => {
    it('builds, signs and submits the contract call and returns the hash', async () => {
      const { callContractMethod } = await loadClient();
      const signer = makeSigner();
      const args = [nativeToScVal('escrow-1')];

      const hash = await callContractMethod(CONTRACT_ID, 'release', signer, args);

      expect(hash).toBe('tx-hash');
      expect(ServerCtor).toHaveBeenCalledWith('https://rpc.example.test');
      expect(mockServer.getAccount).toHaveBeenCalledWith(SIGNER_KEY);

      const prepared = mockServer.prepareTransaction.mock.calls[0][0] as Transaction;
      expect(prepared.source).toBe(SIGNER_KEY);
      expect(prepared.networkPassphrase).toBe(Networks.TESTNET);
      const { method, args: sentArgs } = invokedCall(prepared);
      expect(method).toBe('release');
      expect(sentArgs.map((a) => scValToNative(a))).toEqual(['escrow-1']);

      expect(signer.signTransaction).toHaveBeenCalledWith(prepared.toXDR());
      const submitted = mockServer.sendTransaction.mock.calls[0][0] as Transaction;
      expect(submitted.toXDR()).toBe(prepared.toXDR());
      expect(mockServer.getTransaction).toHaveBeenCalledWith('tx-hash');
    });

    it('uses the mainnet passphrase when VITE_STELLAR_NETWORK=mainnet', async () => {
      const { callContractMethod } = await loadClient('mainnet');

      await callContractMethod(CONTRACT_ID, 'release', makeSigner());

      const prepared = mockServer.prepareTransaction.mock.calls[0][0] as Transaction;
      expect(prepared.networkPassphrase).toBe(Networks.PUBLIC);
    });

    it('reuses a single RPC server across calls', async () => {
      const { callContractMethod } = await loadClient();

      await callContractMethod(CONTRACT_ID, 'release', makeSigner());
      await callContractMethod(CONTRACT_ID, 'release', makeSigner());

      expect(ServerCtor).toHaveBeenCalledTimes(1);
    });

    it('throws when submission returns ERROR', async () => {
      const { callContractMethod } = await loadClient();
      mockServer.sendTransaction.mockResolvedValue({ status: 'ERROR', errorResultXdr: 'bad-xdr' });

      await expect(callContractMethod(CONTRACT_ID, 'release', makeSigner())).rejects.toThrow(
        'Transaction submission failed: bad-xdr',
      );
      expect(mockServer.getTransaction).not.toHaveBeenCalled();
    });

    it('polls until the transaction succeeds', async () => {
      vi.useFakeTimers();
      const { callContractMethod } = await loadClient();
      mockServer.getTransaction
        .mockResolvedValueOnce({ status: 'NOT_FOUND' })
        .mockResolvedValueOnce({ status: 'SUCCESS' });

      const pending = callContractMethod(CONTRACT_ID, 'release', makeSigner());
      await vi.advanceTimersByTimeAsync(1000);

      await expect(pending).resolves.toBe('tx-hash');
      expect(mockServer.getTransaction).toHaveBeenCalledTimes(2);
    });

    it('throws when the transaction fails on-chain', async () => {
      const { callContractMethod } = await loadClient();
      mockServer.getTransaction.mockResolvedValue({ status: 'FAILED', resultXdr: 'fail-xdr' });

      await expect(callContractMethod(CONTRACT_ID, 'release', makeSigner())).rejects.toThrow(
        'Transaction failed: fail-xdr',
      );
    });

    it('throws after the polling timeout', async () => {
      vi.useFakeTimers();
      const { callContractMethod } = await loadClient();
      mockServer.getTransaction.mockResolvedValue({ status: 'NOT_FOUND' });

      const assertion = expect(callContractMethod(CONTRACT_ID, 'release', makeSigner())).rejects.toThrow(
        'Transaction polling timeout after 120000ms',
      );
      await vi.advanceTimersByTimeAsync(120000);

      await assertion;
    });
  });

  describe('readContractState', () => {
    it('simulates the call and decodes the return value', async () => {
      const { readContractState } = await loadClient();
      mockServer.simulateTransaction.mockResolvedValue({
        result: { retval: nativeToScVal({ status: 'ACTIVE', amount: 100 }) },
      });

      const state = await readContractState<{ status: string; amount: bigint }>(CONTRACT_ID, 'get_state', [
        nativeToScVal('escrow-1'),
      ]);

      expect(state).toEqual({ status: 'ACTIVE', amount: 100n });
      const simulated = mockServer.simulateTransaction.mock.calls[0][0] as Transaction;
      const { method, args } = invokedCall(simulated);
      expect(method).toBe('get_state');
      expect(args.map((a) => scValToNative(a))).toEqual(['escrow-1']);
      expect(mockServer.getAccount).not.toHaveBeenCalled();
    });

    it('throws on a simulation error', async () => {
      const { readContractState } = await loadClient();
      mockServer.simulateTransaction.mockResolvedValue({ error: 'contract panicked' });

      await expect(readContractState(CONTRACT_ID, 'get_state')).rejects.toThrow(
        'Simulation error for get_state: contract panicked',
      );
    });

    it('throws when the simulation returns no result', async () => {
      const { readContractState } = await loadClient();
      mockServer.simulateTransaction.mockResolvedValue({});

      await expect(readContractState(CONTRACT_ID, 'get_state')).rejects.toThrow(
        'Simulation failed for get_state: no result returned',
      );
    });
  });

  describe('toScVal', () => {
    it('converts native values to ScVal', async () => {
      const { toScVal } = await loadClient();

      const str = toScVal('escrow-1');
      const num = toScVal(42);
      const bool = toScVal(true);

      expect(str).toBeInstanceOf(xdr.ScVal);
      expect(str.switch()).toBe(xdr.ScValType.scvString());
      expect(scValToNative(str)).toBe('escrow-1');
      expect(scValToNative(num)).toBe(42n);
      expect(bool.switch()).toBe(xdr.ScValType.scvBool());
      expect(scValToNative(bool)).toBe(true);
    });
  });
});
