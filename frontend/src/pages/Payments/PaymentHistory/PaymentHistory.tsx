import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowUpDown,
  X,
} from "lucide-react";
import PaymentSummaryCards from "../PaymentSummaryCards";

type PaymentStatus = "Pending" | "Escrowed" | "Released" | "Failed";

interface Payment {
  id: string;
  date: string;
  shipmentId: string;
  amount: number;
  token: string;
  status: PaymentStatus;
  txHash: string;
}

const statusClasses: Record<PaymentStatus, string> = {
  Pending:
    "bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.3)]",
  Escrowed:
    "bg-[rgba(98,255,255,0.15)] text-[#62ffff] border border-[rgba(98,255,255,0.3)]",
  Released:
    "bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.3)]",
  Failed:
    "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]",
};

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
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
          <h2 className="text-lg font-bold text-[#62ffff]">Payment Details</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <dl className="flex flex-col gap-3 text-sm">
          {(
            [
              ["Shipment ID", payment.shipmentId],
              ["Date", payment.date],
              [
                "Amount",
                `$${payment.amount.toLocaleString()} ${payment.token}`,
              ],
              ["Status", payment.status],
              ["Tx Hash", payment.txHash],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-text-secondary">{label}</dt>
              <dd className="text-white font-medium break-all text-right">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

const PaymentHistory: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  // ✅ ADDED
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "All">(
    "All",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const itemsPerPage = 10;

  const allPayments: Payment[] = [
    {
      id: "1",
      date: "2026-02-26",
      shipmentId: "SHP-9021",
      amount: 5420.5,
      token: "USDC",
      status: "Released",
      txHash: "0x4a9b2f81c3e5d7a9b2f81c3e5d7a9b2f81c3e5d7",
    },
    {
      id: "2",
      date: "2026-02-25",
      shipmentId: "SHP-8842",
      amount: 3200.0,
      token: "XLM",
      status: "Escrowed",
      txHash: "0x9c1a9e55b7d4f2c8a1e9b7d4f2c8a1e9b7d4f2c8",
    },
    {
      id: "3",
      date: "2026-02-24",
      shipmentId: "SHP-8711",
      amount: 7850.75,
      token: "USDC",
      status: "Released",
      txHash: "0x2e8f3a6c9d1b5e7f3a6c9d1b5e7f3a6c9d1b5e7f",
    },
    {
      id: "4",
      date: "2026-02-23",
      shipmentId: "SHP-8590",
      amount: 1250.0,
      token: "USDC",
      status: "Pending",
      txHash: "0x7b4d2f9a8c3e6d1b4f9a8c3e6d1b4f9a8c3e6d1b",
    },
    {
      id: "5",
      date: "2026-02-22",
      shipmentId: "SHP-8421",
      amount: 4100.25,
      token: "XLM",
      status: "Released",
      txHash: "0x5c9e1a7f3b8d2c6e1a7f3b8d2c6e1a7f3b8d2c6e",
    },
    {
      id: "6",
      date: "2026-02-21",
      shipmentId: "SHP-8305",
      amount: 2980.0,
      token: "USDC",
      status: "Failed",
      txHash: "0x8d3f6b2a9c5e1d7f6b2a9c5e1d7f6b2a9c5e1d7f",
    },
    {
      id: "7",
      date: "2026-02-20",
      shipmentId: "SHP-8192",
      amount: 6750.5,
      token: "USDC",
      status: "Released",
      txHash: "0x1f7c4e9b3a6d8f2c4e9b3a6d8f2c4e9b3a6d8f2c",
    },
    {
      id: "8",
      date: "2026-02-19",
      shipmentId: "SHP-8043",
      amount: 3450.0,
      token: "XLM",
      status: "Escrowed",
      txHash: "0x6a2d8f1c5b9e3a7d8f1c5b9e3a7d8f1c5b9e3a7d",
    },
    {
      id: "9",
      date: "2026-02-18",
      shipmentId: "SHP-7921",
      amount: 5200.75,
      token: "USDC",
      status: "Released",
      txHash: "0x9e5b3f7a2d6c1e8b3f7a2d6c1e8b3f7a2d6c1e8b",
    },
    {
      id: "10",
      date: "2026-02-17",
      shipmentId: "SHP-7805",
      amount: 2100.0,
      token: "USDC",
      status: "Pending",
      txHash: "0x3c8a6f2d9b1e5c7a6f2d9b1e5c7a6f2d9b1e5c7a",
    },
    {
      id: "11",
      date: "2026-02-16",
      shipmentId: "SHP-7692",
      amount: 8900.5,
      token: "XLM",
      status: "Released",
      txHash: "0x7d1f9c4a8e2b6d3f9c4a8e2b6d3f9c4a8e2b6d3f",
    },
    {
      id: "12",
      date: "2026-02-15",
      shipmentId: "SHP-7543",
      amount: 4320.25,
      token: "USDC",
      status: "Escrowed",
      txHash: "0x2b6e9a3f7c1d5e8a3f7c1d5e8a3f7c1d5e8a3f7c",
    },
    {
      id: "13",
      date: "2026-02-14",
      shipmentId: "SHP-7421",
      amount: 1850.0,
      token: "USDC",
      status: "Released",
      txHash: "0x5f3c8d1a9b7e2f4c8d1a9b7e2f4c8d1a9b7e2f4c",
    },
    {
      id: "14",
      date: "2026-02-13",
      shipmentId: "SHP-7305",
      amount: 6100.75,
      token: "XLM",
      status: "Failed",
      txHash: "0x8a4f2c9d6b3e1a7f2c9d6b3e1a7f2c9d6b3e1a7f",
    },
    {
      id: "15",
      date: "2026-02-12",
      shipmentId: "SHP-7192",
      amount: 3700.0,
      token: "USDC",
      status: "Released",
      txHash: "0x1d7b5f9c3a8e6d2b5f9c3a8e6d2b5f9c3a8e6d2b",
    },
    {
      id: "16",
      date: "2026-02-11",
      shipmentId: "SHP-7081",
      amount: 5550.5,
      token: "USDC",
      status: "Pending",
      txHash: "0x4e9a2f6c8d1b7e3a2f6c8d1b7e3a2f6c8d1b7e3a",
    },
  ];

  const filteredPayments =
    filterStatus === "All"
      ? allPayments
      : allPayments.filter((p) => p.status === filterStatus);
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return sortOrder === "desc" ? -diff : diff;
  });
  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = sortedPayments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const truncateHash = (hash: string) =>
    `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  const getStellarExplorerUrl = (hash: string) =>
    `https://stellar.expert/explorer/public/tx/${hash}`;

  const tableContainerClass =
    "bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden mb-5 shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)]";
  const thClass =
    "text-left px-6 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]";
  const tdClass = "px-6 py-4 text-sm border-b border-[rgba(98,255,255,0.2)]";

  // if (isLoading) {
  //     return (
  //         <div className="p-6 md:p-4">
  //             <div className="mb-6">
  //                 <h1 className="text-2xl font-bold mb-1">Payment History</h1>
  //                 <p className="text-text-secondary text-sm">
  //                     Track all payment transactions on the blockchain
  //                 </p>
  //             </div>
  //             <div className={`${tableContainerClass} p-6`}>
  //                 {[...Array(10)].map((_, i) => (
  //                     <div
  //                         key={i}
  //                         className="grid grid-cols-[1fr_1fr_1fr_1fr_1.5fr] gap-6 mb-4"
  //                     >
  //                         {[...Array(5)].map((__, j) => (
  //                             <div
  //                                 key={j}
  //                                 className="h-8 rounded animate-shimmer-teal"
  //                             />
  //                         ))}
  //                     </div>
  //                 ))}
  //             </div>
  //         </div>
  //     );
  // }

  if (sortedPayments.length === 0) {
    return (
      <div className="p-6 md:p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Payment History</h1>
          <p className="text-text-secondary text-sm">
            Track all payment transactions on the blockchain
          </p>
        </div>
        <div className={`${tableContainerClass} px-10 py-20 text-center`}>
          <div className="text-[64px] mb-4">💳</div>
          <h2 className="text-xl font-bold mb-2 text-[#62ffff]">
            No Payments Found
          </h2>
          <p className="text-text-secondary text-sm">
            There are no payment transactions matching your criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 max-md:text-xl max-md:font-semibold">
            Payment History
          </h1>
          <p className="text-text-secondary text-sm max-md:text-xs">
            Track all payment transactions on the blockchain
          </p>
        </div>
        <div className="flex gap-3 max-md:w-full max-md:flex-col max-md:gap-2">
          <div className="relative flex items-center max-md:w-full">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as PaymentStatus | "All");
                setCurrentPage(1);
              }}
              className="appearance-none bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary px-3.5 py-2 pr-9 rounded-lg text-sm font-medium cursor-pointer outline-none hover:border-[#62ffff] hover:bg-[rgba(19,186,186,0.15)] transition-colors max-md:w-full"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Escrowed">Escrowed</option>
              <option value="Released">Released</option>
              <option value="Failed">Failed</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 pointer-events-none text-text-secondary"
            />
          </div>
          <span
            className="inline-flex items-center gap-2 appearance-none bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] text-text-primary px-3.5 py-2 pr-9 rounded-lg text-sm font-medium cursor-pointer outline-none hover:border-[#62ffff] hover:bg-[rgba(19,186,186,0.15)] transition-colors max-md:w-full max-md:justify-center"
            onClick={() =>
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
            }
          >
            Date
            <ArrowUpDown size={14} />
            <span className=" text-text-secondary max-md:hidden">
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </span>
          </span>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <PaymentSummaryCards />

      {/* Table */}
      <div className={`${tableContainerClass} md:overflow-x-auto`}>
        <table className="w-full border-collapse md:min-w-200">
          <thead className="bg-[rgba(19,186,186,0.1)]">
            <tr>
              <th
                className={`${thClass} cursor-pointer select-none`}
                onClick={() =>
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                }
              >
                <span className="inline-flex items-center gap-2">
                  Date <ArrowUpDown size={14} />
                </span>
              </th>
              <th className={thClass}>Shipment ID</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Transaction Hash</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(itemsPerPage)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className={tdClass}>
                        <div className="h-8 w-full rounded bg-[rgba(98,255,255,0.1)] animate-shimmer-teal" />
                      </td>
                    ))}
                  </tr>
                ))
              : paginatedPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-[rgba(98,255,255,0.05)] transition-colors last:border-b-0 cursor-pointer"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsModalOpen(true);
                    }}
                  >
                    <td
                      className={`${tdClass} font-medium text-text-secondary`}
                    >
                      {new Date(payment.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className={tdClass}>
                      <Link
                        to={`/dashboard/shipments/${payment.shipmentId}`}
                        className="text-[#62ffff] font-semibold no-underline hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {payment.shipmentId}
                      </Link>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">
                          ${payment.amount.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-text-secondary uppercase">
                          {payment.token}
                        </span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase inline-block ${statusClasses[payment.status]}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td
                      className={`${tdClass} font-['Courier_New',monospace] text-xs`}
                    >
                      <a
                        href={getStellarExplorerUrl(payment.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-text-secondary no-underline flex items-center gap-1.5 transition-colors hover:text-[#62ffff]"
                      >
                        {truncateHash(payment.txHash)}
                        <ExternalLink size={12} className="text-[#62ffff]" />
                      </a>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-6 py-4 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-xl shadow-[inset_0_0_15px_0px_rgba(0,128,128,0.2)] md:flex-col md:gap-4">
        <div className="text-sm text-text-secondary">
          Showing {startIndex + 1}–
          {Math.min(startIndex + itemsPerPage, sortedPayments.length)} of{" "}
          {sortedPayments.length}
        </div>
        <div className="flex gap-2 md:w-full md:justify-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-9 transition-all hover:not-disabled:bg-[rgba(98,255,255,0.1)] hover:not-disabled:border-[#62ffff] hover:not-disabled:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`border px-3 py-2 rounded-md text-sm font-semibold cursor-pointer min-w-9 transition-all ${
                currentPage === i + 1
                  ? "bg-[#62ffff] border-[#62ffff] text-black"
                  : "bg-transparent border-[rgba(98,255,255,0.2)] text-text-primary hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] hover:text-[#62ffff]"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="bg-transparent border border-[rgba(98,255,255,0.2)] text-text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-center min-w-9 transition-all hover:not-disabled:bg-[rgba(98,255,255,0.1)] hover:not-disabled:border-[#62ffff] hover:not-disabled:text-[#62ffff] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <PaymentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PaymentHistory;
