import { apiClient } from "../client";

export type SettlementStatus =
    | "PENDING"
    | "ESCROWED"
    | "RELEASED"
    | "DISPUTED"
    | "FAILED";

export interface SettlementSummary {
    totalSettledAmount: number;
    pendingCount: number;
    disputedCount: number;
    totalCount: number;
}

export interface Settlement {
    _id: string;
    createdAt: string;
    updatedAt?: string;
    shipmentId: string;
    payerAddress?: string;
    payeeAddress?: string;
    amount: number;
    token: string;
    status: SettlementStatus;
    stellarTxHash?: string;

    // Escrow-specific data (may be omitted on list endpoint)
    escrowRelease?: {
        conditionDescription?: string;
        releasedAt?: string;
        releasedBy?: string;
        disputedAt?: string;
        disputeReason?: string;
    };
}

export interface SettlementDetail {
    settlement: {
        _id: string;
        createdAt: string;
        updatedAt?: string;
        shipmentId: string;
        payerAddress?: string;
        payeeAddress?: string;
        amount: number;
        token: string;
        status: SettlementStatus;
        stellarTxHash?: string;
        escrowRelease?: {
            conditionDescription?: string;
            releasedAt?: string;
            releasedBy?: string;
            disputeReason?: string;
            disputedAt?: string;
            additionalNotes?: string;
        };
    };
    summary?: {
        totalSettledAmount?: number;
        pendingCount?: number;
        disputedCount?: number;
    };
}

export interface GetSettlementsParams {
    page?: number;
    limit?: number;
    status?: SettlementStatus | "ALL";
    sortBy?: "createdAt";
    sortOrder?: "asc" | "desc";
}

export interface PaginatedSettlements {
    data: Settlement[];
    page: number;
    limit: number;
    total: number;
}

export const settlementsApi = {
    getSettlements: async (
        params?: GetSettlementsParams,
    ): Promise<PaginatedSettlements> => {
        const res = await apiClient.get<{ data: PaginatedSettlements }>(
            "/settlements",
            { params },
        );
        return res.data.data;
    },

    getSettlementById: async (id: string): Promise<SettlementDetail> => {
        const res = await apiClient.get<{ data: SettlementDetail }>(
            `/settlements/${id}`,
        );
        return res.data.data;
    },

    getByShipmentId: async (shipmentId: string): Promise<Settlement[]> => {
        const res = await apiClient.get<{ data: PaginatedSettlements }>(
            "/settlements",
            { params: { shipmentId } },
        );
        return res.data.data.data;
    },
};

