import { apiClient } from "../client";

export type MilestoneEvent =
    | "SHIPMENT_CREATED"
    | "PICKUP_CONFIRMED"
    | "IN_TRANSIT"
    | "CUSTOMS_CLEARED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "SETTLEMENT_INITIATED"
    | "SETTLEMENT_COMPLETED"
    | "PROOF_SUBMITTED";

export interface LedgerBlock {
    blockNumber: number;
    timestamp: string;
    shipmentId: string;
    shipmentReference: string;
    milestoneEvent: MilestoneEvent;
    transactionHash: string;
    ledger: number;
    verified: boolean;
}

export interface PaginatedLedgerBlocks {
    data: LedgerBlock[];
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
}

export interface GetLedgerBlocksParams {
    cursor?: string;
    limit?: number;
    shipmentId?: string;
    milestoneEvent?: MilestoneEvent;
}

export const ledgerApi = {
    getBlocks: async (params?: GetLedgerBlocksParams): Promise<PaginatedLedgerBlocks> => {
        const res = await apiClient.get<PaginatedLedgerBlocks>("/ledger/blocks", { params });
        return res.data;
    },
};
