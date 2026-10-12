import { callContractMethod, readContractState, toScVal } from "./client";
import type { TransactionSigner } from "./client";

const ESCROW_CONTRACT_ID =
  import.meta.env.VITE_ESCROW_CONTRACT_ID ?? "";

export interface EscrowState {
  id: string;
  payer: string;
  payee: string;
  amount: number;
  token: string;
  status: "PENDING" | "ACTIVE" | "RELEASED" | "DISPUTED";
  milestones: string[];
  confirmedMilestones: string[];
}

export const escrowContract = {
  createEscrow: async (
    escrowId: string,
    payer: string,
    payee: string,
    amount: number,
    signer: TransactionSigner,
  ): Promise<string> => {
    if (!ESCROW_CONTRACT_ID) {
      throw new Error("VITE_ESCROW_CONTRACT_ID is not configured");
    }
    return callContractMethod(ESCROW_CONTRACT_ID, "initialize", signer, [
      toScVal(escrowId),
      toScVal(payer),
      toScVal(payee),
      toScVal(amount),
    ]);
  },

  confirmMilestone: async (
    escrowId: string,
    milestoneId: string,
    signer: TransactionSigner,
  ): Promise<string> => {
    if (!ESCROW_CONTRACT_ID) {
      throw new Error("VITE_ESCROW_CONTRACT_ID is not configured");
    }
    return callContractMethod(ESCROW_CONTRACT_ID, "confirm_milestone", signer, [
      toScVal(escrowId),
      toScVal(milestoneId),
    ]);
  },

  releasePayment: async (
    escrowId: string,
    signer: TransactionSigner,
  ): Promise<string> => {
    if (!ESCROW_CONTRACT_ID) {
      throw new Error("VITE_ESCROW_CONTRACT_ID is not configured");
    }
    return callContractMethod(ESCROW_CONTRACT_ID, "release", signer, [
      toScVal(escrowId),
    ]);
  },

  getState: async (escrowId: string): Promise<EscrowState> => {
    if (!ESCROW_CONTRACT_ID) {
      throw new Error("VITE_ESCROW_CONTRACT_ID is not configured");
    }
    return readContractState<EscrowState>(
      ESCROW_CONTRACT_ID,
      "get_state",
      [toScVal(escrowId)],
    );
  },
};
