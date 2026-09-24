// frontend/src/pages/Payments/PaymentDetailModal/PaymentDetailModal.tsx
import React, { useRef } from "react";
import { X, ExternalLink, ShieldCheck, MapPin } from "lucide-react";
import { useFocusTrap } from "@hooks/useFocusTrap";

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
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, isOpen, onClose);

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

    const getStatusBadgeClass = (status: string) => {
        const s = status.toLowerCase();
        const base = "px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ";
        if (s === "pending") return base + "bg-amber-500/15 text-amber-400 border border-amber-500/30";
        if (s === "escrowed") return base + "bg-[#62ffff]/15 text-[#62ffff] border border-[#62ffff]/30";
        if (s === "released") return base + "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
        return base + "bg-red-500/15 text-red-400 border border-red-500/30";
    };

    return (
        <div
            className="fixed inset-0 bg-[#000d10]/85 backdrop-blur-[8px] flex items-center justify-center z-[1000] animate-[modal-fadeIn_0.3s_ease]"
            onClick={onClose}
        >
            <style>{`
                @keyframes modal-fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modal-slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-modal-title"
                tabIndex={-1}
                className="bg-[#082832]/95 border-[1.5px] border-[#62ffff]/20 rounded-[2rem] w-[90%] max-w-[550px] relative overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_30px_rgba(0,212,200,0.1)] animate-[modal-slideUp_0.4s_cubic-bezier(0.23,1,0.32,1)]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-6 right-6 bg-transparent border-none text-[#62ffff]/50 cursor-pointer transition-colors hover:text-[#62ffff]"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                <div className="pt-10 px-8 pb-6 bg-gradient-to-b from-[#00d4c8]/5 to-transparent border-b border-[#62ffff]/10">
                    <div className="flex items-center gap-4 mb-3">
                        <span className={getStatusBadgeClass(payment.status)}>
                            {payment.status}
                        </span>
                        <span className="text-xs text-[#62ffff]/40 font-mono">
                            ID: #{payment.id.padStart(6, "0")}
                        </span>
                    </div>
                    <h2 id="payment-modal-title" className="font-['Bebas_Neue',sans-serif] text-[3.5rem] m-0 text-white tracking-[0.02em]">
                        {payment.amount.toLocaleString()}{" "}
                        <span className="text-[#00d4c8] text-2xl align-middle">{payment.token}</span>
                    </h2>
                </div>

                <div className="p-8">
                    <div className="grid gap-5 mb-10">
                        <div className="flex justify-between items-center">
                            <span className="text-[0.7rem] font-bold text-[#62ffff]/40 tracking-widest">SHIPMENT</span>
                            <a
                                href={`/dashboard/shipments/${payment.shipmentId}`}
                                className="text-[#62ffff] no-underline font-semibold hover:underline text-[0.9rem] flex items-center gap-2"
                            >
                                {payment.shipmentId} <MapPin size={14} />
                            </a>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[0.7rem] font-bold text-[#62ffff]/40 tracking-widest">TRANSACTION</span>
                            <a
                                href={getStellarExplorerUrl(payment.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#62ffff] no-underline font-semibold hover:underline text-[0.9rem] flex items-center gap-2 font-mono"
                            >
                                {payment.txHash.slice(0, 12)}...
                                {payment.txHash.slice(-8)}{" "}
                                <ExternalLink size={14} />
                            </a>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[0.7rem] font-bold text-[#62ffff]/40 tracking-widest">PAYER</span>
                            <span className="text-[0.9rem] text-white flex items-center gap-2 font-mono">
                                GBST...4X7P <ShieldCheck size={14} />
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[0.7rem] font-bold text-[#62ffff]/40 tracking-widest">PAYEE</span>
                            <span className="text-[0.9rem] text-white flex items-center gap-2 font-mono">
                                GCSV...9L2M <ShieldCheck size={14} />
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-['Bebas_Neue',sans-serif] text-2xl m-0 mb-5 tracking-[0.04em] text-white">
                            PAYMENT <span className="text-[#00d4c8]">TIMELINE</span>
                        </h3>
                        <div className="flex flex-col gap-6 relative pl-2">
                            <div className="absolute top-0 left-[0.9rem] h-full w-[2px] bg-[#62ffff]/10"></div>
                            {statusSteps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className={`flex gap-6 relative transition-opacity duration-300 ${step.active ? "opacity-100" : "opacity-30"}`}
                                >
                                    <div className={`w-[10px] h-[10px] rounded-full z-10 mt-[5px] transition-all duration-300 ${step.active ? 'bg-[#00d4c8] border-2 border-[#62ffff] shadow-[0_0_10px_rgba(98,255,255,0.5)]' : 'bg-[#082832] border-2 border-[#62ffff]/30'}`}></div>
                                    <div className="flex flex-col gap-[0.15rem]">
                                        <span className="text-[0.85rem] font-bold text-white">
                                            {step.label}
                                        </span>
                                        <span className="text-[0.75rem] text-[#c8e6f0]/60">
                                            {step.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 px-8 pb-10 flex gap-4">
                    <button className="font-['Bebas_Neue',sans-serif] flex-1 p-3 rounded-xl text-[1.1rem] tracking-wider cursor-pointer transition-all duration-200 text-center no-underline bg-transparent text-white border border-[#62ffff]/20 hover:bg-[#62ffff]/10 hover:border-[#62ffff]" onClick={onClose}>
                        CLOSE
                    </button>
                    <a
                        href={getStellarExplorerUrl(payment.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-['Bebas_Neue',sans-serif] flex-1 p-3 rounded-xl text-[1.1rem] tracking-wider cursor-pointer transition-all duration-200 text-center no-underline bg-[#00d4c8] text-black border border-[#00d4c8] hover:bg-[#62ffff] hover:border-[#62ffff]"
                    >
                        VERIFY ON BLOCKCHAIN
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailModal;
