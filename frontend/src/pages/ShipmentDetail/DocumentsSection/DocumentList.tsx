import React from "react";
import type {
  DocumentType,
  ShipmentDocument,
} from "../../../services/api/endpoints/shipments";
import { formatDate } from "../../../utils/localeFormat";
import { DOCUMENT_TYPE_LABELS, formatBytes } from "./documentUtils";

export interface DocumentListProps {
  documents: ShipmentDocument[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}

const DocumentIcon: React.FC<{ type: DocumentType }> = ({ type }) => {
  const color =
    type === "BILL_OF_LADING"
      ? "#00d4c8"
      : type === "COMMERCIAL_INVOICE"
        ? "#f59e0b"
        : type === "PACKING_LIST"
          ? "#60a5fa"
          : type === "CUSTOMS_DECLARATION"
            ? "#a78bfa"
            : "rgba(255,255,255,0.5)";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
};

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  hasError,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[rgba(255,255,255,0.5)]">
        <svg
          className="animate-spin-svg w-8 h-8 mr-3"
          viewBox="0 0 50 50"
          aria-hidden="true"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
            stroke="#00d4c8"
          />
        </svg>
        <span>Loading documents…</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-12 text-[rgba(255,255,255,0.6)] gap-3 text-center"
      >
        <p className="m-0 text-sm">
          Couldn&apos;t load documents for this shipment.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="text-[#00d4c8] text-sm font-medium bg-[rgba(0,212,200,0.08)] border border-[rgba(0,212,200,0.2)] rounded-lg px-4 py-2 transition-all hover:bg-[rgba(0,212,200,0.15)] hover:border-[rgba(0,212,200,0.4)]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[rgba(255,255,255,0.5)] gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(0,180,160,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="m-0 text-sm">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <ul className="list-none p-0 m-0 flex flex-col gap-3" role="list">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="bg-[rgba(0,0,0,0.2)] border border-[rgba(0,180,160,0.15)] rounded-2xl px-6 py-4 flex items-center gap-4 transition-all hover:border-[rgba(0,212,200,0.3)] hover:bg-[rgba(0,212,200,0.03)] sm:flex-col sm:items-start sm:gap-3"
        >
          {/* Icon */}
          <div className="shrink-0">
            <DocumentIcon type={doc.type} />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <p className="m-0 text-white font-medium text-sm truncate">
              {doc.name}
            </p>
            <p className="m-0 mt-1 text-[rgba(255,255,255,0.5)] text-xs flex flex-wrap gap-x-3 gap-y-0.5">
              <span>{DOCUMENT_TYPE_LABELS[doc.type]}</span>
              <span aria-hidden="true">·</span>
              <span>{formatDate(doc.uploadDate)}</span>
              <span aria-hidden="true">·</span>
              <span>Uploaded by {doc.uploader}</span>
              {doc.sizeBytes != null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{formatBytes(doc.sizeBytes)}</span>
                </>
              )}
            </p>
          </div>

          {/* Download link */}
          <a
            href={doc.url}
            download={doc.name}
            className="shrink-0 flex items-center gap-1.5 text-[#00d4c8] text-sm font-medium bg-[rgba(0,212,200,0.08)] border border-[rgba(0,212,200,0.2)] rounded-lg px-3 py-1.5 transition-all hover:bg-[rgba(0,212,200,0.15)] hover:border-[rgba(0,212,200,0.4)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,212,200,0.5)]"
            aria-label={`Download ${doc.name}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </a>
        </li>
      ))}
    </ul>
  );
};

export default DocumentList;
