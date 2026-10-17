import { SettlementStatus } from "@services/api/endpoints/settlements";

export const statusClasses: Record<SettlementStatus, string> = {
  PENDING:
    "bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.3)]",
  ESCROWED:
    "bg-[rgba(98,255,255,0.15)] text-[#62ffff] border border-[rgba(98,255,255,0.3)]",
  RELEASED:
    "bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.3)]",
  DISPUTED:
    "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]",
  FAILED:
    "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]",
};

export const statusDotClasses: Record<SettlementStatus, string> = {
  PENDING: "bg-[#fbbf24]",
  ESCROWED: "bg-[#62ffff]",
  RELEASED: "bg-[#34d399]",
  DISPUTED: "bg-[#f87171]",
  FAILED: "bg-[#f87171]",
};

export const truncateHash = (hash?: string): string => {
  if (!hash) return "-";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};
