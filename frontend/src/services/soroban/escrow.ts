import { callContractMethod, readContractState, toScVal } from "./client";
import type { TransactionSigner } from "./client";

const ESCROW_CONTRACT_ID = import.meta.env.VITE_ESCROW_CONTRACT_ID ?? "";

/**
 * On-chain shipment status enum variants matching `navin-contracts` `ShipmentStatus`.
 */
export type OnChainShipmentStatus =
  | "Created"
  | "InTransit"
  | "AtCheckpoint"
  | "PartiallyDelivered"
  | "Delivered"
  | "Disputed"
  | "Cancelled"
  | "PartiallyRefunded";

/**
 * On-chain `Shipment` struct returned by `get_shipment(env, shipment_id: u64)`
 * in `navin-contracts/contracts/shipment/src/types.rs`.
 */
export interface OnChainShipment {
  id: bigint | number;
  sender: string;
  receiver: string;
  carrier: string;
  status: OnChainShipmentStatus | [OnChainShipmentStatus];
  data_hash: Uint8Array | string;
  created_at: bigint | number;
  updated_at: bigint | number;
  escrow_amount: bigint | number;
  total_escrow: bigint | number;
  payment_milestones?: Array<[string, number]>;
  paid_milestones?: string[];
  milestones_completed?: string[];
  deadline: bigint | number;
  integration_nonce: number;
  finalized: boolean;
}

export type EscrowState = OnChainShipment;

/**
 * Complete contract error code table matching all 75 active `NavinError`
 * variants (`#[repr(u32)]`, codes `1..=78` with `12, 13, 71` reserved) in
 * `navin-contracts/contracts/shipment/src/errors.rs`.
 */
export const NAVIN_CONTRACT_ERRORS: Record<number, { name: string; message: string }> = {
  1: { name: "AlreadyInitialized", message: "Contract is already initialized." },
  2: { name: "NotInitialized", message: "Contract has not been initialized." },
  3: { name: "Unauthorized", message: "Caller does not have the required permissions." },
  4: { name: "ShipmentNotFound", message: "Shipment ID does not exist on-chain." },
  5: { name: "InvalidStatus", message: "Invalid state transition for the shipment." },
  6: { name: "InvalidHash", message: "Provided 32-byte data hash is invalid." },
  7: { name: "EscrowLocked", message: "Escrow is locked and cannot be modified." },
  8: { name: "InsufficientFunds", message: "Insufficient funds for escrow deposit." },
  9: { name: "ShipmentAlreadyCompleted", message: "Shipment is already completed." },
  10: { name: "InvalidTimestamp", message: "Invalid timestamp provided." },
  11: { name: "CounterOverflow", message: "Counter value overflowed maximum capacity." },
  14: { name: "InvalidAmount", message: "Escrow amount must be strictly positive." },
  15: { name: "ReentrancyDetected", message: "Reentrancy lock is active." },
  16: { name: "BatchTooLarge", message: "Batch creation array exceeds maximum allowed item limit." },
  17: { name: "InvalidShipmentInput", message: "Shipment input contained invalid parameters." },
  18: { name: "MilestoneSumInvalid", message: "Milestone percentages do not sum to 100%." },
  19: { name: "MilestoneAlreadyPaid", message: "Milestone has already been paid." },
  20: { name: "MetadataLimitExceeded", message: "Maximum metadata entries exceeded." },
  21: { name: "RateLimitExceeded", message: "Minimum time interval between status updates has not elapsed." },
  22: { name: "ProposalNotFound", message: "Multi-sig proposal ID does not exist." },
  23: { name: "ProposalAlreadyExecuted", message: "Multi-sig proposal has already been executed." },
  24: { name: "ProposalExpired", message: "Multi-sig proposal has expired." },
  25: { name: "AlreadyApproved", message: "Caller has already approved this proposal." },
  26: { name: "InsufficientApprovals", message: "Proposal does not have enough admin approvals." },
  27: { name: "NotAnAdmin", message: "Caller is not an administrator." },
  28: { name: "InvalidMultiSigConfig", message: "Invalid multi-sig admin list or threshold." },
  29: { name: "NotExpired", message: "Shipment deadline has not elapsed yet." },
  30: { name: "ShipmentLimitReached", message: "Active shipment limit reached for company." },
  31: { name: "InvalidConfig", message: "Contract configuration parameter is invalid." },
  32: { name: "CannotSelfRevoke", message: "Caller cannot revoke their own role." },
  33: { name: "CarrierSuspended", message: "Carrier account is suspended." },
  34: { name: "ForceCancelReasonHashMissing", message: "Force-cancel reason hash is required." },
  35: { name: "ArithmeticError", message: "Checked escrow arithmetic failed." },
  36: { name: "DisputeReasonHashMissing", message: "Dispute reason hash is required." },
  37: { name: "CompanySuspended", message: "Company account is suspended." },
  38: { name: "ShipmentFinalized", message: "Shipment is finalized and locked." },
  39: { name: "TokenTransferFailed", message: "Cross-contract token transfer failed." },
  40: { name: "TokenMintFailed", message: "Cross-contract token mint failed." },
  41: { name: "DuplicateAction", message: "Action was already submitted within the idempotency window." },
  42: { name: "ShipmentUnavailable", message: "Shipment state is archived or expired." },
  43: { name: "ContractPaused", message: "Contract is paused by an administrator." },
  44: { name: "StatusHashNotFound", message: "Status hash not found for shipment and status." },
  45: { name: "DataHashMismatch", message: "Provided hash does not match stored hash." },
  46: { name: "CircuitBreakerOpen", message: "Token transfer circuit breaker is open." },
  47: { name: "InvalidMigrationEdge", message: "Migration version transition is not allowed." },
  48: { name: "MilestoneLimitExceeded", message: "Maximum milestone events reached for shipment." },
  49: { name: "NoteLimitExceeded", message: "Maximum note events reached for shipment." },
  50: { name: "EvidenceLimitExceeded", message: "Maximum dispute evidence entries reached." },
  51: { name: "BreachLimitExceeded", message: "Maximum condition breach events reached." },
  52: { name: "InvalidTokenDecimals", message: "Token decimals do not match the expected 7 decimals." },
  53: { name: "CreationQuotaExceeded", message: "Company exceeded the shipment creation quota." },
  54: { name: "DependenciesNotMet", message: "Prerequisite shipments are not yet completed." },
  55: { name: "CircularDependency", message: "Circular dependency detected in shipment prerequisites." },
  56: { name: "ProposalSaltReused", message: "Proposal salt was already used." },
  57: { name: "InvalidShipmentParticipants", message: "Sender, receiver, and carrier addresses must be distinct." },
  58: { name: "InvalidShipmentDeadline", message: "Shipment deadline must be strictly in the future." },
  59: { name: "InvalidPaymentMilestones", message: "Payment milestone list is malformed." },
  60: { name: "DuplicatePaymentMilestone", message: "Payment milestone checkpoint names must be unique." },
  61: { name: "InvalidTokenAddress", message: "Shipment token address is invalid." },
  62: { name: "InvalidPaymentMilestoneName", message: "Payment milestone checkpoint name format is invalid." },
  63: { name: "MetadataSymbolCollision", message: "Metadata key and value symbols collide." },
  64: { name: "ExternalIntegrationFailed", message: "External settlement integration failed." },
  65: { name: "InvalidSymbol", message: "Provided symbol is empty or invalid." },
  66: { name: "NoteNotFound", message: "Shipment note not found." },
  67: { name: "EvidenceNotFound", message: "Dispute evidence entry not found." },
  68: { name: "RoleAlreadyAssigned", message: "Address already holds the requested role." },
  69: { name: "CarrierNotWhitelisted", message: "Carrier is not listed in the company whitelist." },
  70: { name: "InvalidAddress", message: "Provided Stellar address is invalid." },
  72: { name: "RoleMismatch", message: "Target address does not hold the role being revoked." },
  73: { name: "InvalidSymbolEncoding", message: "Symbol XDR encoding is invalid." },
  74: { name: "MultiSigProposalPending", message: "Cannot re-initialize multi-sig while a proposal is pending." },
  75: { name: "CarrierAlreadyWhitelisted", message: "Carrier is already in the company whitelist." },
  76: { name: "AuditLogLimitExceeded", message: "Maximum audit log entries reached." },
  77: { name: "NftMintFailed", message: "Configured NFT contract failed to mint a settlement proof." },
  78: { name: "NftConfigurationFailed", message: "Settlement NFT contract could not be configured." },
};

export class NavinContractError extends Error {
  readonly code?: number;
  readonly errorName?: string;

  constructor(message: string, code?: number, errorName?: string) {
    super(message);
    this.name = "NavinContractError";
    this.code = code;
    this.errorName = errorName;
  }
}

export function mapContractError(err: unknown): Error {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const match =
    rawMessage.match(/Error\(Contract,\s*#(\d+)\)/i) ??
    rawMessage.match(/ContractError\((\d+)\)/i);
  if (match) {
    const code = Number(match[1]);
    const info = NAVIN_CONTRACT_ERRORS[code];
    if (info) {
      return new NavinContractError(
        `${info.name} (#${code}): ${info.message}`,
        code,
        info.name,
      );
    }
    return new NavinContractError(`Contract error #${code}`, code);
  }
  return err instanceof Error ? err : new Error(rawMessage);
}

export function parseShipmentIdU64(shipmentId: string | number | bigint): bigint {
  if (typeof shipmentId === "bigint") {
    if (shipmentId < 0n) throw new Error("shipment_id must be a non-negative u64");
    return shipmentId;
  }
  if (typeof shipmentId === "number") {
    if (!Number.isInteger(shipmentId) || shipmentId < 0) {
      throw new Error("shipment_id must be a non-negative integer");
    }
    return BigInt(shipmentId);
  }
  const trimmed = shipmentId.trim().replace(/^#/, "");
  if (/^\d+$/.test(trimmed)) {
    return BigInt(trimmed);
  }
  const trailingDigits = trimmed.match(/(\d+)$/);
  if (trailingDigits) {
    return BigInt(trailingDigits[1]);
  }
  throw new Error(`Invalid u64 shipment_id: "${shipmentId}"`);
}

export function encodeBytes32(hash: string | Uint8Array): Uint8Array {
  if (hash instanceof Uint8Array) {
    if (hash.length !== 32) {
      throw new Error(`Expected 32-byte hash, received ${hash.length} bytes`);
    }
    return hash;
  }
  const clean = hash.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
    throw new Error("Hash must be a 64-character hex string (32 bytes)");
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function requireContractId(): string {
  if (!ESCROW_CONTRACT_ID) {
    throw new Error("VITE_ESCROW_CONTRACT_ID is not configured");
  }
  return ESCROW_CONTRACT_ID;
}

export const escrowContract = {
  /**
   * Read on-chain shipment & escrow state via `get_shipment(env, shipment_id: u64)`.
   */
  getShipment: async (shipmentId: string | number | bigint): Promise<OnChainShipment> => {
    const contractId = requireContractId();
    const idU64 = parseShipmentIdU64(shipmentId);
    try {
      return await readContractState<OnChainShipment>(contractId, "get_shipment", [
        toScVal(idU64, { type: "u64" }),
      ]);
    } catch (err) {
      throw mapContractError(err);
    }
  },

  /**
   * Deposit escrow funds via `deposit_escrow(env, from: Address, shipment_id: u64, amount: i128)`.
   */
  depositEscrow: async (
    from: string,
    shipmentId: string | number | bigint,
    amount: number | bigint,
    signer: TransactionSigner,
  ): Promise<string> => {
    const contractId = requireContractId();
    const idU64 = parseShipmentIdU64(shipmentId);
    const amountI128 = BigInt(amount);
    if (amountI128 <= 0n) {
      throw new Error("Escrow deposit amount must be positive");
    }
    try {
      return await callContractMethod(contractId, "deposit_escrow", signer, [
        toScVal(from, { type: "address" }),
        toScVal(idU64, { type: "u64" }),
        toScVal(amountI128, { type: "i128" }),
      ]);
    } catch (err) {
      throw mapContractError(err);
    }
  },

  /**
   * Confirm delivery on-chain via `confirm_delivery(env, receiver: Address, shipment_id: u64, confirmation_hash: BytesN<32>)`.
   */
  confirmDelivery: async (
    receiver: string,
    shipmentId: string | number | bigint,
    confirmationHash: string | Uint8Array,
    signer: TransactionSigner,
  ): Promise<string> => {
    const contractId = requireContractId();
    const idU64 = parseShipmentIdU64(shipmentId);
    const hashBytes = encodeBytes32(confirmationHash);
    try {
      return await callContractMethod(contractId, "confirm_delivery", signer, [
        toScVal(receiver, { type: "address" }),
        toScVal(idU64, { type: "u64" }),
        toScVal(hashBytes),
      ]);
    } catch (err) {
      throw mapContractError(err);
    }
  },

  /**
   * Release escrowed funds via `release_escrow(env, caller: Address, shipment_id: u64)`.
   */
  releaseEscrow: async (
    caller: string,
    shipmentId: string | number | bigint,
    signer: TransactionSigner,
  ): Promise<string> => {
    const contractId = requireContractId();
    const idU64 = parseShipmentIdU64(shipmentId);
    try {
      return await callContractMethod(contractId, "release_escrow", signer, [
        toScVal(caller, { type: "address" }),
        toScVal(idU64, { type: "u64" }),
      ]);
    } catch (err) {
      throw mapContractError(err);
    }
  },

  /**
   * Raise an on-chain dispute via `raise_dispute(env, caller: Address, shipment_id: u64, reason_hash: BytesN<32>)`.
   */
  raiseDispute: async (
    caller: string,
    shipmentId: string | number | bigint,
    reasonHash: string | Uint8Array,
    signer: TransactionSigner,
  ): Promise<string> => {
    const contractId = requireContractId();
    const idU64 = parseShipmentIdU64(shipmentId);
    const hashBytes = encodeBytes32(reasonHash);
    try {
      return await callContractMethod(contractId, "raise_dispute", signer, [
        toScVal(caller, { type: "address" }),
        toScVal(idU64, { type: "u64" }),
        toScVal(hashBytes),
      ]);
    } catch (err) {
      throw mapContractError(err);
    }
  },
};
