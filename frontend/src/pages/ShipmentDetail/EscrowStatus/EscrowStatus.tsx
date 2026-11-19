import React, { useContext, useEffect, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import {
    settlementsApi,
    Settlement,
    SettlementStatus,
} from "@services/api/endpoints/settlements";
import Skeleton from "@components/ui/Skeleton/Skeleton";
import { getStellarExpertTxUrl } from "@utils/stellar";
import { WalletContext } from "@context/useWallet";
import { escrowContract, type OnChainShipment } from "@services/soroban";

export interface EscrowStatusProps {
    shipmentId: string;
    /**
     * Changing this value re-reads the escrow/settlement state (without
     * flashing the loading skeleton), so the parent can keep it fresh.
     */
    refreshKey?: number | null;
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

const formatOnChainStatus = (
    status: OnChainShipment["status"],
): string => (Array.isArray(status) ? status[0] : String(status));

const EscrowStatus: React.FC<EscrowStatusProps> = ({ shipmentId, refreshKey }) => {
    const wallet = useContext(WalletContext);
    const connectedPublicKey = wallet?.publicKey ?? null;

    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [onChainRefreshCount, setOnChainRefreshCount] = useState(0);
    const [releasingEscrow, setReleasingEscrow] = useState(false);
    const [releaseTxHash, setReleaseTxHash] = useState<string | null>(null);

    const requestKey = connectedPublicKey && shipmentId
        ? `${connectedPublicKey}:${shipmentId}:${refreshKey ?? ""}:${onChainRefreshCount}`
        : null;
    const [completedOnChainKey, setCompletedOnChainKey] = useState<string | null>(null);
    const [onChainShipment, setOnChainShipment] = useState<OnChainShipment | null>(null);
    const [onChainError, setOnChainError] = useState<string | null>(null);

    const onChainLoading = Boolean(requestKey && completedOnChainKey !== requestKey);

    const canReleaseOnChain = Boolean(
        connectedPublicKey &&
            wallet?.signTransaction &&
            !wallet.networkMismatch &&
            onChainShipment &&
            !onChainShipment.finalized &&
            BigInt(onChainShipment.escrow_amount) > 0n &&
            formatOnChainStatus(onChainShipment.status) === "Delivered",
    );

    const handleReleaseEscrow = async () => {
        if (!connectedPublicKey || !wallet?.signTransaction) return;
        setReleasingEscrow(true);
        setOnChainError(null);
        try {
            const txHash = await escrowContract.releaseEscrow(
                connectedPublicKey,
                shipmentId,
                {
                    publicKey: connectedPublicKey,
                    signTransaction: wallet.signTransaction,
                },
            );
            setReleaseTxHash(txHash);
            setOnChainRefreshCount((c) => c + 1);
        } catch (err: unknown) {
            setOnChainError(
                err instanceof Error
                    ? err.message
                    : "Failed to release on-chain escrow.",
            );
        } finally {
            setReleasingEscrow(false);
        }
    };

    useEffect(() => {
        if (!shipmentId) return;
        let cancelled = false;
        settlementsApi
            .getByShipmentId(shipmentId)
            .then((data) => {
                if (cancelled) return;
                setSettlements(data);
                setError(null);
            })
            .catch(() => {
                if (!cancelled) setError("Failed to load escrow records.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [shipmentId, refreshKey]);

    useEffect(() => {
        if (!requestKey || !shipmentId) return;
        let cancelled = false;
        escrowContract
            .getShipment(shipmentId)
            .then((state) => {
                if (cancelled) return;
                setOnChainShipment(state);
                setOnChainError(null);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setOnChainShipment(null);
                setOnChainError(
                    err instanceof Error
                        ? err.message
                        : "Failed to read on-chain shipment state.",
                );
            })
            .finally(() => {
                if (!cancelled) {
                    setCompletedOnChainKey(requestKey);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [requestKey, shipmentId]);

    return (
        <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6">
            <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
                ESCROW <span className="text-[#00d4c8]">STATUS</span>
            </h2>

            {connectedPublicKey && (
                <div
                    data-testid="onchain-shipment-panel"
                    className="bg-[rgba(0,0,0,0.25)] rounded-2xl border border-[rgba(0,212,200,0.25)] px-6 py-5 mb-6"
                >
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <span className="text-xs uppercase tracking-wider text-[#00d4c8] font-semibold">
                            Soroban On-Chain Shipment State ({wallet?.network ?? "testnet"})
                        </span>
                        <span className="text-xs font-mono text-[rgba(255,255,255,0.55)]">
                            Wallet: {truncateHash(connectedPublicKey)}
                        </span>
                    </div>

                    {onChainLoading && (
                        <p className="text-sm text-[rgba(200,230,240,0.75)]" role="status">
                            Loading on-chain shipment state…
                        </p>
                    )}

                    {!onChainLoading && onChainError && (
                        <p className="text-sm text-red-400" role="alert">
                            {onChainError}
                        </p>
                    )}

                    {!onChainLoading && !onChainError && onChainShipment && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white mt-2">
                            <div>
                                <span className="text-[rgba(255,255,255,0.5)] block text-xs">
                                    On-Chain Status
                                </span>
                                <span className="font-semibold text-[#00d4c8]">
                                    {formatOnChainStatus(onChainShipment.status)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[rgba(255,255,255,0.5)] block text-xs">
                                    Escrow Balance
                                </span>
                                <span className="font-semibold">
                                    {String(onChainShipment.escrow_amount)} / {String(onChainShipment.total_escrow)} stroops
                                </span>
                            </div>
                            <div>
                                <span className="text-[rgba(255,255,255,0.5)] block text-xs">
                                    Finalized
                                </span>
                                <span className="font-semibold">
                                    {onChainShipment.finalized ? "Yes" : "No"}
                                </span>
                            </div>
                            {canReleaseOnChain && (
                                <div className="sm:col-span-3 pt-1">
                                    <button
                                        type="button"
                                        disabled={releasingEscrow}
                                        onClick={() => void handleReleaseEscrow()}
                                        className="px-4 py-2 rounded-xl bg-[#00d4c8]/20 border border-[#00d4c8]/50 text-[#00d4c8] text-xs font-semibold hover:bg-[#00d4c8]/30 disabled:opacity-50"
                                    >
                                        {releasingEscrow ? "Signing & Releasing…" : "Release On-Chain Escrow"}
                                    </button>
                                </div>
                            )}
                            {releaseTxHash && (
                                <div className="sm:col-span-3 text-xs text-[rgba(255,255,255,0.7)]">
                                    Release Tx: <span className="font-mono text-[#00d4c8]">{truncateHash(releaseTxHash)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
                    <span className="sr-only">Loading escrow records…</span>
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] px-6 py-5 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <Skeleton width={120} height={22} />
                                <Skeleton width={90} height={26} rounded="full" />
                            </div>
                            <Skeleton width={200} height={16} />
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && settlements.length === 0 && (
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

            {!loading && settlements.length > 0 && (
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
                                        href={getStellarExpertTxUrl(s.stellarTxHash)}
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
