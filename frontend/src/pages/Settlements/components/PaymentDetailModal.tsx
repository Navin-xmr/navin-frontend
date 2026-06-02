import { useEffect } from "react";
import { X } from "lucide-react";
import { Settlement, SettlementDetail } from "@services/api/endpoints/settlements";

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    settlement: Settlement | null;
    detail: SettlementDetail | null;
    isLoading?: boolean;
}

const truncate = (s?: string) => {
    if (!s) return "-";
    if (s.length <= 16) return s;
    return `${s.slice(0, 12)}...${s.slice(-8)}`;
};

const getStellarExplorerUrl = (hash?: string) => {
    if (!hash) return undefined;
    return `https://stellar.expert/explorer/public/tx/${hash}`;
};

export default function PaymentDetailModal({
    isOpen,
    onClose,
    settlement,
    detail,
    isLoading,
}: PaymentDetailModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const effective = detail?.settlement ?? settlement;
    if (!effective) return null;

    const url = getStellarExplorerUrl(effective.stellarTxHash);

    const conditionDescription = effective.escrowRelease?.conditionDescription;
    const releasedAt = effective.escrowRelease?.releasedAt;
    const disputedAt = effective.escrowRelease?.disputedAt;
    const disputeReason = effective.escrowRelease?.disputeReason;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-[rgba(8,40,50,0.95)] border border-[rgba(98,255,255,0.2)] rounded-2xl p-6 w-full max-w-md shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#62ffff]">Escrow Details</h2>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-text-secondary text-sm">Loading escrow information...</div>
                ) : (
                    <>
                        <dl className="flex flex-col gap-3 text-sm">
                            {([
                                ["Shipment", effective.shipmentId],
                                [
                                    "Amount",
                                    `${effective.amount.toLocaleString()} ${effective.token}`,
                                ],
                                ["Status", effective.status],
                                ["Stellar Tx", truncate(effective.stellarTxHash)],
                            ] as [string, string][]).map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-4">
                                    <dt className="text-text-secondary">{label}</dt>
                                    <dd className="text-white font-medium break-all text-right">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-5 border-t border-[rgba(98,255,255,0.12)] pt-4">
                            <div className="text-sm font-semibold text-white mb-2">Release conditions</div>
                            <div className="text-text-secondary text-sm leading-relaxed">
                                {conditionDescription ?? "-"}
                            </div>

                            <div className="mt-3 grid gap-2">
                                <div className="flex justify-between gap-4">
                                    <span className="text-text-secondary">Released at</span>
                                    <span className="text-white font-medium">{releasedAt ?? "-"}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-text-secondary">Disputed at</span>
                                    <span className="text-white font-medium">{disputedAt ?? "-"}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-text-secondary">Dispute reason</span>
                                    <span className="text-white font-medium">{disputeReason ?? "-"}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex justify-between gap-4">
                                    <span className="text-text-secondary">Payer</span>
                                    <span className="text-white font-medium">{effective.payerAddress ?? "-"}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-text-secondary">Payee</span>
                                    <span className="text-white font-medium">{effective.payeeAddress ?? "-"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-3 py-2 rounded-lg border border-[rgba(98,255,255,0.2)] text-text-primary hover:border-[#62ffff] hover:text-[#62ffff]"
                            >
                                Close
                            </button>
                            {url ? (
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-3 py-2 rounded-lg bg-[#00d4c8] text-black text-center font-semibold"
                                >
                                    Verify on Blockchain
                                </a>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

