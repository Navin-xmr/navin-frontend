import Modal from "@components/common/Modal";
import { Settlement, SettlementDetail } from "@services/api/endpoints/settlements";

interface SettlementDetailModalProps {
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

/**
 * Settlement escrow detail dialog.
 *
 * Previously re-implemented its own backdrop, ESC handling and focus trap;
 * migrated onto the shared accessible `common/Modal` primitive (issue #637).
 */
export default function SettlementDetailModal({
    isOpen,
    onClose,
    settlement,
    detail,
    isLoading,
}: SettlementDetailModalProps) {
    if (!isOpen) return null;

    const effective = detail?.settlement ?? settlement;
    if (!effective) return null;

    const url = getStellarExplorerUrl(effective.stellarTxHash);

    const conditionDescription = effective.escrowRelease?.conditionDescription;
    const releasedAt = effective.escrowRelease?.releasedAt;
    const disputedAt = effective.escrowRelease?.disputedAt;
    const disputeReason = effective.escrowRelease?.disputeReason;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Escrow Details"
            size="md"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-3 py-2 rounded-lg border border-[rgba(98,255,255,0.2)] text-text-primary hover:border-[#62ffff] hover:text-[#62ffff]"
                    >
                        Close
                    </button>
                    {url ? (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg bg-[#00d4c8] text-black text-center font-semibold"
                        >
                            Verify on Blockchain
                        </a>
                    ) : null}
                </>
            }
        >
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
                </>
            )}
        </Modal>
    );
}