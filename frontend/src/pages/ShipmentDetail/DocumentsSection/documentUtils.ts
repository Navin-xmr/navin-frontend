import type { DocumentType } from "../../../services/api/endpoints/shipments";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  BILL_OF_LADING: "Bill of Lading",
  COMMERCIAL_INVOICE: "Commercial Invoice",
  PACKING_LIST: "Packing List",
  CUSTOMS_DECLARATION: "Customs Declaration",
  OTHER: "Other",
};

export const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
export const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
