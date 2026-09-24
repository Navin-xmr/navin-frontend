import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  callContractMethod: vi.fn(),
  readContractState: vi.fn(),
  toScVal: vi.fn((value: unknown) => ({ scVal: value })),
}));

import { callContractMethod, readContractState } from './client';

const mockCall = vi.mocked(callContractMethod);
const mockRead = vi.mocked(readContractState);

const CONTRACT_ID = 'CESCROWCONTRACT';
const signer = { publicKey: 'GPUBKEY', signTransaction: vi.fn() };

async function loadEscrow(contractId = CONTRACT_ID) {
  vi.stubEnv('VITE_ESCROW_CONTRACT_ID', contractId);
  return (await import('./escrow')).escrowContract;
}

describe('escrowContract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockCall.mockResolvedValue('tx-hash');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('createEscrow calls initialize with escrow id, payer, payee and amount', async () => {
    const escrow = await loadEscrow();

    await expect(escrow.createEscrow('esc-1', 'GPAYER', 'GPAYEE', 500, signer)).resolves.toBe('tx-hash');

    expect(mockCall).toHaveBeenCalledWith(CONTRACT_ID, 'initialize', signer, [
      { scVal: 'esc-1' },
      { scVal: 'GPAYER' },
      { scVal: 'GPAYEE' },
      { scVal: 500 },
    ]);
  });

  it('confirmMilestone calls confirm_milestone with escrow and milestone ids', async () => {
    const escrow = await loadEscrow();

    await escrow.confirmMilestone('esc-1', 'ms-2', signer);

    expect(mockCall).toHaveBeenCalledWith(CONTRACT_ID, 'confirm_milestone', signer, [
      { scVal: 'esc-1' },
      { scVal: 'ms-2' },
    ]);
  });

  it('releasePayment calls release with the escrow id', async () => {
    const escrow = await loadEscrow();

    await escrow.releasePayment('esc-1', signer);

    expect(mockCall).toHaveBeenCalledWith(CONTRACT_ID, 'release', signer, [{ scVal: 'esc-1' }]);
  });

  it('getState reads get_state with the escrow id', async () => {
    const state = { id: 'esc-1', status: 'ACTIVE' };
    mockRead.mockResolvedValue(state);
    const escrow = await loadEscrow();

    await expect(escrow.getState('esc-1')).resolves.toBe(state);

    expect(mockRead).toHaveBeenCalledWith(CONTRACT_ID, 'get_state', [{ scVal: 'esc-1' }]);
  });

  it('rejects every method when VITE_ESCROW_CONTRACT_ID is not configured', async () => {
    const escrow = await loadEscrow('');
    const message = 'VITE_ESCROW_CONTRACT_ID is not configured';

    await expect(escrow.createEscrow('esc-1', 'GPAYER', 'GPAYEE', 500, signer)).rejects.toThrow(message);
    await expect(escrow.confirmMilestone('esc-1', 'ms-2', signer)).rejects.toThrow(message);
    await expect(escrow.releasePayment('esc-1', signer)).rejects.toThrow(message);
    await expect(escrow.getState('esc-1')).rejects.toThrow(message);
    expect(mockCall).not.toHaveBeenCalled();
    expect(mockRead).not.toHaveBeenCalled();
  });
});
