import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  callContractMethod: vi.fn(),
  readContractState: vi.fn(),
  toScVal: vi.fn((value: unknown, opts?: { type?: string }) => ({ scVal: value, opts })),
}));

import { callContractMethod, readContractState } from './client';

const mockCall = vi.mocked(callContractMethod);
const mockRead = vi.mocked(readContractState);

const CONTRACT_ID = 'CESCROWCONTRACT';
const signer = { publicKey: 'GPUBKEY', signTransaction: vi.fn() };
const VALID_HASH_HEX = 'a'.repeat(64);

async function loadEscrowModule(contractId = CONTRACT_ID) {
  vi.stubEnv('VITE_ESCROW_CONTRACT_ID', contractId);
  return import('./escrow');
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

  it('getShipment reads get_shipment with u64 shipment_id', async () => {
    const onChainState = {
      id: 42n,
      sender: 'GSENDER',
      receiver: 'GRECEIVER',
      carrier: 'GCARRIER',
      status: 'InTransit' as const,
      data_hash: new Uint8Array(32),
      created_at: 1700000000n,
      updated_at: 1700000100n,
      escrow_amount: 5000000000n,
      total_escrow: 5000000000n,
      deadline: 1700086400n,
      integration_nonce: 1,
      finalized: false,
    };
    mockRead.mockResolvedValue(onChainState);
    const { escrowContract } = await loadEscrowModule();

    await expect(escrowContract.getShipment('ship-42')).resolves.toEqual(onChainState);

    expect(mockRead).toHaveBeenCalledWith(CONTRACT_ID, 'get_shipment', [
      { scVal: 42n, opts: { type: 'u64' } },
    ]);
  });

  it('depositEscrow calls deposit_escrow with (from, shipment_id: u64, amount: i128)', async () => {
    const { escrowContract } = await loadEscrowModule();

    await expect(
      escrowContract.depositEscrow('GCOMPANY', 7, 25000000n, signer),
    ).resolves.toBe('tx-hash');

    expect(mockCall).toHaveBeenCalledWith(CONTRACT_ID, 'deposit_escrow', signer, [
      { scVal: 'GCOMPANY', opts: { type: 'address' } },
      { scVal: 7n, opts: { type: 'u64' } },
      { scVal: 25000000n, opts: { type: 'i128' } },
    ]);
  });

  it('confirmDelivery calls confirm_delivery with (receiver, shipment_id: u64, confirmation_hash: BytesN<32>)', async () => {
    const { escrowContract, encodeBytes32 } = await loadEscrowModule();
    const expectedBytes = encodeBytes32(VALID_HASH_HEX);

    await expect(
      escrowContract.confirmDelivery('GRECEIVER', '12', VALID_HASH_HEX, signer),
    ).resolves.toBe('tx-hash');

    expect(mockCall).toHaveBeenCalledWith(CONTRACT_ID, 'confirm_delivery', signer, [
      { scVal: 'GRECEIVER', opts: { type: 'address' } },
      { scVal: 12n, opts: { type: 'u64' } },
      { scVal: expectedBytes, opts: undefined },
    ]);
  });

  it('releaseEscrow calls release_escrow with (caller, shipment_id: u64)', async () => {
    const { escrowContract } = await loadEscrowModule();

    await expect(
      escrowContract.releaseEscrow('GRECEIVER', 99n, signer),
    ).resolves.toBe('tx-hash');

    expect(mockCall).toHaveBeenCalledWith(CONTRACT_ID, 'release_escrow', signer, [
      { scVal: 'GRECEIVER', opts: { type: 'address' } },
      { scVal: 99n, opts: { type: 'u64' } },
    ]);
  });

  it('raiseDispute calls raise_dispute with (caller, shipment_id: u64, reason_hash: BytesN<32>)', async () => {
    const { escrowContract, encodeBytes32 } = await loadEscrowModule();
    const expectedBytes = encodeBytes32(`0x${VALID_HASH_HEX}`);

    await expect(
      escrowContract.raiseDispute('GCALLER', '#ship-15', `0x${VALID_HASH_HEX}`, signer),
    ).resolves.toBe('tx-hash');

    expect(mockCall).toHaveBeenCalledWith(CONTRACT_ID, 'raise_dispute', signer, [
      { scVal: 'GCALLER', opts: { type: 'address' } },
      { scVal: 15n, opts: { type: 'u64' } },
      { scVal: expectedBytes, opts: undefined },
    ]);
  });

  it('validates argument encoding for u64 shipment IDs, positive amounts, and 32-byte hashes', async () => {
    const { escrowContract } = await loadEscrowModule();

    await expect(escrowContract.getShipment('no-digits-here')).rejects.toThrow(
      'Invalid u64 shipment_id',
    );
    await expect(escrowContract.depositEscrow('GCOMPANY', 1, 0, signer)).rejects.toThrow(
      'Escrow deposit amount must be positive',
    );
    await expect(
      escrowContract.confirmDelivery('GRECEIVER', 1, 'short-hash', signer),
    ).rejects.toThrow('Hash must be a 64-character hex string (32 bytes)');
  });

  it('maps NavinError contract codes to descriptive NavinContractError messages', async () => {
    mockRead.mockRejectedValueOnce(
      new Error('Simulation error for get_shipment: HostError: Error(Contract, #4)'),
    );
    mockCall.mockRejectedValueOnce(
      new Error('Transaction failed: Error(Contract, #7)'),
    );
    const { escrowContract } = await loadEscrowModule();

    await expect(escrowContract.getShipment(404)).rejects.toThrow(
      'ShipmentNotFound (#4): Shipment ID does not exist on-chain.',
    );
    await expect(escrowContract.releaseEscrow('GCALLER', 404, signer)).rejects.toThrow(
      'EscrowLocked (#7): Escrow is locked and cannot be modified.',
    );

    const { NAVIN_CONTRACT_ERRORS, mapContractError } = await loadEscrowModule();
    expect(Object.keys(NAVIN_CONTRACT_ERRORS)).toHaveLength(75);
    expect(mapContractError(new Error('HostError: Error(Contract, #52)')).message).toBe(
      'InvalidTokenDecimals (#52): Token decimals do not match the expected 7 decimals.',
    );
    expect(mapContractError(new Error('HostError: Error(Contract, #78)')).message).toBe(
      'NftConfigurationFailed (#78): Settlement NFT contract could not be configured.',
    );
  });

  it('rejects every method when VITE_ESCROW_CONTRACT_ID is not configured', async () => {
    const { escrowContract } = await loadEscrowModule('');
    const message = 'VITE_ESCROW_CONTRACT_ID is not configured';

    await expect(escrowContract.getShipment(1)).rejects.toThrow(message);
    await expect(escrowContract.depositEscrow('GCOMPANY', 1, 500, signer)).rejects.toThrow(message);
    await expect(
      escrowContract.confirmDelivery('GRECEIVER', 1, VALID_HASH_HEX, signer),
    ).rejects.toThrow(message);
    await expect(escrowContract.releaseEscrow('GRECEIVER', 1, signer)).rejects.toThrow(message);
    await expect(
      escrowContract.raiseDispute('GCALLER', 1, VALID_HASH_HEX, signer),
    ).rejects.toThrow(message);
    expect(mockCall).not.toHaveBeenCalled();
    expect(mockRead).not.toHaveBeenCalled();
  });
});
