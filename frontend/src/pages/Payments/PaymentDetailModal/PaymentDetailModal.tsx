// frontend/src/pages/Payments/PaymentDetailModal/PaymentDetailModal.tsx
import React, { useEffect } from "react";
import { X, ExternalLink, ShieldCheck, MapPin } from "lucide-react";
import "./PaymentDetailModal.css";

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: {
        id: string;
        date: string;
        shipmentId: string;
        amount: number;
        token: string;
        status: string;
        txHash: string;
        payerAddress?: string;
        payeeAddress?: string;
    } | null;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
    isOpen,
    onClose,
    payment,
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen || !payment) return null;

    const getStellarExplorerUrl = (hash: string) =>
        `https://stellar.expert/explorer/public/tx/${hash}`;

    const statusSteps = [
        {
            label: "Pending",
            timestamp: payment.date + " 09:00 AM",
            active: true,
        },
        {
            label: "Escrowed",
            timestamp: payment.date + " 02:30 PM",
            active: ["Escrowed", "Released"].includes(payment.status),
        },
        {
            label: "Released",
            timestamp: payment.date + " 11:45 PM",
            active: payment.status === "Released",
        },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <div className="header-top">
                        <span
                            className={`status-badge ${payment.status.toLowerCase()}`}
                        >
                            {payment.status}
                        </span>
                        <span className="payment-id">
                            ID: #{payment.id.padStart(6, "0")}
                        </span>
                    </div>
                    <h2 className="payment-amount">
                        {payment.amount.toLocaleString()}{" "}
                        <span className="token">{payment.token}</span>
                    </h2>
                </div>

                <div className="modal-body">
                    <div className="detail-section">
                        <div className="detail-row">
                            <span className="detail-label">SHIPMENT</span>
                            <a
                                href={`/dashboard/shipments/${payment.shipmentId}`}
                                className="detail-value link"
                            >
                                {payment.shipmentId} <MapPin size={14} />
                            </a>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">TRANSACTION</span>
                            <a
                                href={getStellarExplorerUrl(payment.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="detail-value link hash"
                            >
                                {payment.txHash.slice(0, 12)}...
                                {payment.txHash.slice(-8)}{" "}
                                <ExternalLink size={14} />
                            </a>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">PAYER</span>
                            <span className="detail-value mono">
                                GBST...4X7P <ShieldCheck size={14} />
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">PAYEE</span>
                            <span className="detail-value mono">
                                GCSV...9L2M <ShieldCheck size={14} />
                            </span>
                        </div>
                    </div>

                    <div className="timeline-section">
                        <h3 className="section-title">
                            PAYMENT <span className="highlight">TIMELINE</span>
                        </h3>
                        <div className="timeline">
                            {statusSteps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className={`timeline-item ${step.active ? "active" : ""}`}
                                >
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-info">
                                        <span className="step-label">
                                            {step.label}
                                        </span>
                                        <span className="step-time">
                                            {step.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="secondary-btn" onClick={onClose}>
                        CLOSE
                    </button>
                    <a
                        href={getStellarExplorerUrl(payment.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-btn"
                    >
                        VERIFY ON BLOCKCHAIN
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailModal;
