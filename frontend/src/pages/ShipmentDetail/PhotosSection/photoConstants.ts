import type { PhotoType } from "@/types/shipmentPhoto";

export const MAX_PHOTOS = 10;
export const MAX_SIZE_MB = 5;
export const PHOTO_TYPES: PhotoType[] = ["PICKUP", "DELIVERY", "DAMAGE", "OTHER"];

export const TYPE_STYLES: Record<PhotoType, { pill: string; dot: string }> = {
  PICKUP: { pill: "bg-[#3B82F6]/15 text-[#60a5fa] border border-[#3B82F6]/30", dot: "bg-[#3B82F6]" },
  DELIVERY: { pill: "bg-[#10B981]/15 text-[#34d399] border border-[#10B981]/30", dot: "bg-[#10B981]" },
  DAMAGE: { pill: "bg-[#EF4444]/15 text-[#f87171] border border-[#EF4444]/30", dot: "bg-[#EF4444]" },
  OTHER: { pill: "bg-white/8 text-[#9CA3AF] border border-white/10", dot: "bg-[#9CA3AF]" },
};
