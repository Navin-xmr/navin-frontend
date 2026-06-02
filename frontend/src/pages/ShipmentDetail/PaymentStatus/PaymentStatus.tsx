import React from "react";
import { ExternalLink, Wallet, CreditCard, ArrowRightLeft, Hash } from "lucide-react";

export type PaymentStatusType = "pending" | "escrowed" | "released" | "failed";

export interface PaymentData {
  amount: string;
  tokenSymbol: string;
  status: PaymentStatusType;
  payerAddress: string;
  payeeAddress: string;
  transactionHash: string;
}

export interface PaymentStatusProps {
  payment?: PaymentData | null;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ payment }) => {
  const statusStyles: Record<PaymentStatusType, string> = {
    pending: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
    escrowed: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
    released: "bg-green-500/20 text-green-300 border border-green-500/40",
    failed: "bg-red-500/20 text-red-300 border border-red-500/40",
  };

  const formatStatus = (status: PaymentStatusType): string =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const truncateAddress = (address: string): string => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStellarExplorerUrl = (txHash: string): string =>
    `https://stellar.expert/explorer/testnet/tx/${txHash}`;

  return (
    <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6">
      <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
        PAYMENT <span className="text-[#00d4c8]">STATUS</span>
      </h2>

      {payment ? (
        <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
          {/* Payment Amount Header */}
          <div className="bg-[rgba(0,212,200,0.05)] border-b border-[rgba(0,212,200,0.2)] px-6 py-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[rgba(0,212,200,0.15)] rounded-xl w-12 h-12 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#00d4c8]" />
              </div>
              <div>
                <p className="text-[rgba(255,255,255,0.5)] text-sm m-0 mb-1">Payment Amount</p>
                <p className="text-white text-2xl font-semibold m-0">
                  {payment.amount} <span className="text-[#00d4c8]">{payment.tokenSymbol}</span>
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusStyles[payment.status]}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  payment.status === "pending" ? "bg-yellow-400 animate-pulse" :
                  payment.status === "escrowed" ? "bg-blue-400 animate-pulse" :
                  payment.status === "released" ? "bg-green-400" :
                  "bg-red-400"
                }`}
              />
              {formatStatus(payment.status)}
            </span>
          </div>

          {/* Payment Details */}
          <div className="px-6 py-6 flex flex-col gap-5">
            {/* Payer Address */}
            <div className="flex items-start gap-4">
              <div className="bg-[rgba(0,212,200,0.1)] rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-[#00d4c8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[rgba(255,255,255,0.5)] text-sm m-0 mb-1">Payer Address</p>
                <p className="text-white text-base font-medium m-0 font-mono" title={payment.payerAddress}>
                  {truncateAddress(payment.payerAddress)}
                </p>
              </div>
            </div>

            {/* Payee Address */}
            <div className="flex items-start gap-4">
              <div className="bg-[rgba(0,212,200,0.1)] rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-[#00d4c8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[rgba(255,255,255,0.5)] text-sm m-0 mb-1">Payee Address</p>
                <p className="text-white text-base font-medium m-0 font-mono" title={payment.payeeAddress}>
                  {truncateAddress(payment.payeeAddress)}
                </p>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="flex items-start gap-4">
              <div className="bg-[rgba(0,212,200,0.1)] rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5 text-[#00d4c8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[rgba(255,255,255,0.5)] text-sm m-0 mb-1">Transaction Hash</p>
                <a
                  href={getStellarExplorerUrl(payment.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#00d4c8] text-base font-medium font-mono hover:text-[#1fffff] transition-colors group"
                  title={payment.transactionHash}
                >
                  {truncateAddress(payment.transactionHash)}
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] px-8 py-12 flex flex-col items-center text-center">
          <div className="bg-[rgba(255,255,255,0.05)] rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <Wallet className="w-10 h-10 text-[rgba(255,255,255,0.3)]" />
          </div>
          <h3 className="text-white text-xl font-semibold m-0 mb-2">Payment Not Yet Initiated</h3>
          <p className="text-[rgba(255,255,255,0.5)] text-base m-0 max-w-md">
            No payment has been made for this shipment yet. Payment details will appear here once a transaction is initiated.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;