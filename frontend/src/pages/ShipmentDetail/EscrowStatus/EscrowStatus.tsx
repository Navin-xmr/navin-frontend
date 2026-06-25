import React, { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import {
    settlementsApi,
    Settlement,
    SettlementStatus,
} from "@services/api/endpoints/settlements";

export interface EscrowStatusProps {
    shipmentId: string;
}

const STATUS_STYLES: Record<SettlementStatus, string> = {
    PENDING:
        "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
    ESCROWED:
        "bg-blue-500/20 text-blue-300 border border-blue-500/40",
    RELEASED:
        "bg-green-500/20 text-green-300 border border-green-500/40",
    DISPUTED:
        "bg-red-500/20 text-red-300 border border-red-500/40",
    FAILED:
        "bg-red-500/20 text-red-300 border border-red-500/40",
};

const truncateHash = (hash: string) =>
    hash.length <= 12 ? hash : `${hash.slice(0, 6)}...${hash.slice(-4)}`;

const getStellarExplorerUrl = (hash: string) =>
    `https://stellar.expert/explorer/testnet/tx/${hash}`;

const EscrowStatus: React.FC<EscrowStatusProps> = ({ shipmentId }) => {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shipmentId) return;
        settlementsApi
            .getByShipmentId(shipmentId)
            .then(setSettlements)
            .catch(() => setError("Failed to load escrow records."))
            .finally(() => setLoading(false));
    }, [shipmentId]);

    return (
        <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6">
            <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
                ESCROW <span className="text-[#00d4c8]">STATUS</span>
            </h2>

            {loading && (
                <div className="flex items-center justify-center gap-3 py-10 text-[rgba(255,255,255,0.5)]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading escrow records…</span>
                </div>
            )}

            {!loading && error && (
                <p className="text-center text-red-400 py-8">{error}</p>
            )}

            {!loading && !error && settlements.length === 0 && (
                <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] px-8 py-12 flex flex-col items-center text-center">
                    <div className="bg-[rgba(255,255,255,0.05)] rounded-full w-20 h-20 flex items-center justify-center mb-6">
                        <ShieldCheck className="w-10 h-10 text-[rgba(255,255,255,0.3)]" />
                    </div>
                    <h3 className="text-white text-xl font-semibold m-0 mb-2">
                        No Escrow Records
                    </h3>
                    <p className="text-[rgba(255,255,255,0.5)] text-base m-0 max-w-md">
                        No settlement records found for this shipment yet.
                    </p>
                </div>
            )}

            {!loading && !error && settlements.length > 0 && (
                <div className="flex flex-col gap-4">
                    {settlements.map((s) => (
                        <div
                            key={s._id}
                            className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] px-6 py-5 flex flex-col gap-3"
                        >
                            {/* Status + amount row */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <span className="text-white font-semibold text-lg">
                                    {s.amount}{" "}
                                    <span className="text-[#00d4c8]">{s.token}</span>
                                </span>
                                <span
                                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${STATUS_STYLES[s.status]}`}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            s.status === "RELEASED"
                                                ? "bg-green-400"
                                                : s.status === "ESCROWED"
                                                ? "bg-blue-400 animate-pulse"
                                                : s.status === "PENDING"
                                                ? "bg-yellow-400 animate-pulse"
                                                : "bg-red-400"
                                        }`}
                                    />
                                    {s.status}
                                </span>
                            </div>

                            {/* Transaction hash */}
                            {s.stellarTxHash && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-[rgba(255,255,255,0.5)]">
                                        Tx Hash:
                                    </span>
                                    <a
                                        href={getStellarExplorerUrl(s.stellarTxHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[#00d4c8] font-mono hover:text-[#1fffff] transition-colors"
                                        title={s.stellarTxHash}
                                    >
                                        {truncateHash(s.stellarTxHash)}
                                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                                    </a>
                                </div>
                            )}

                            {/* Escrow release info */}
                            {s.escrowRelease?.releasedAt && (
                                <p className="text-xs text-[rgba(255,255,255,0.4)]">
                                    Released:{" "}
                                    {new Date(s.escrowRelease.releasedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EscrowStatus;
