import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  Download,
  X,
  Loader2,
} from "lucide-react";
import { shipmentApi } from "../../../../services/api/endpoints/shipments";
import type {
  ShipmentDocument,
  DocumentType,
} from "../../../../services/api/endpoints/shipments";
import { useToast } from "../../../../context/ToastContext";
import { ProgressBar } from "../../../../components/ui/ProgressBar/ProgressBar";

interface DocumentsSectionProps {
  shipmentId: string;
  userRole: "company" | "customer";
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  BILL_OF_LADING: "Bill of Lading",
  COMMERCIAL_INVOICE: "Commercial Invoice",
  PACKING_LIST: "Packing List",
  CUSTOMS_DECLARATION: "Customs Declaration",
  OTHER: "Other",
};

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  shipmentId,
  userRole,
}) => {
  const { addToast } = useToast();

  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>("OTHER");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCompany = userRole === "company";

  // Fetch existing documents on mount
  useEffect(() => {
    let cancelled = false;
    shipmentApi
      .getDocuments(shipmentId)
      .then((docs) => {
        if (!cancelled) {
          setDocuments(docs);
          setLoadError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDocs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shipmentId]);

  const validateAndSetFile = useCallback(
    (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        addToast("Only PDF, PNG, and JPG files are allowed.", "error");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        addToast("File exceeds the 10 MB size limit.", "error");
        return;
      }
      setSelectedFile(file);
    },
    [addToast],
  );

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isCompany) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    e.target.value = ""; // allow re-selecting the same file
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(10);

    // Animate progress while the request is in flight
    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? prev : prev + 15));
    }, 250);

    try {
      const newDoc = await shipmentApi.uploadDocument(
        shipmentId,
        selectedFile,
        selectedType,
      );
      clearInterval(interval);
      setUploadProgress(100);
      setDocuments((prev) => [newDoc, ...prev]);
      addToast("Document uploaded successfully.", "success");
      resetUpload();
    } catch {
      clearInterval(interval);
      setUploadProgress(0);
      setIsUploading(false);
      addToast("Failed to upload document. Please try again.", "error");
    }
  };

  const resetUpload = () => {
    // Brief delay so the full bar is visible before tearing down
    setTimeout(() => {
      setSelectedFile(null);
      setSelectedType("OTHER");
      setUploadProgress(0);
      setIsUploading(false);
    }, 400);
  };

  return (
    <section
      className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6"
      aria-label="Shipment documents"
    >
      <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
        SHIPMENT <span className="text-[#00d4c8]">DOCUMENTS</span>
      </h2>

      {/* Upload area — company users only */}
      {isCompany && (
        <div className="mb-8">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload document. Click to open the file picker or drag and drop a file."
            className={`border-2 border-dashed rounded-2xl min-h-36 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer select-none px-4 ${
              isDragging
                ? "border-[#00d4c8] bg-[rgba(0,212,200,0.05)]"
                : "border-[rgba(0,180,160,0.4)] hover:border-[#00d4c8] hover:bg-[rgba(0,212,200,0.05)]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !selectedFile) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              aria-label="Select document file"
            />

            {selectedFile ? (
              <div className="flex items-center gap-3 bg-[rgba(0,212,200,0.08)] border border-[rgba(0,212,200,0.25)] rounded-xl px-4 py-3 w-full max-w-lg my-4">
                <FileText size={20} className="text-[#00d4c8] shrink-0" />
                <span className="text-white text-sm font-medium truncate flex-1">
                  {selectedFile.name}
                </span>
                <span className="text-[rgba(255,255,255,0.5)] text-xs shrink-0">
                  {formatBytes(selectedFile.size)}
                </span>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="shrink-0 text-[rgba(255,255,255,0.4)] hover:text-[#ff3b30] transition-colors"
                    aria-label="Remove selected file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-8 text-[rgba(255,255,255,0.7)]">
                <UploadCloud size={48} className="text-[#00d4c8] mb-4" aria-hidden="true" />
                <p className="text-[1.1rem] font-medium text-white m-0 mb-2">
                  Click or drag &amp; drop to upload
                </p>
                <p className="text-[0.9rem] m-0 text-[rgba(200,230,240,0.5)]">
                  PDF, PNG or JPG (max. 10 MB)
                </p>
              </div>
            )}
          </div>

          {/* Type selector, progress, and upload action */}
          {selectedFile && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="doc-type-select"
                  className="text-white font-medium text-sm"
                >
                  Document Type
                </label>
                <select
                  id="doc-type-select"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  disabled={isUploading}
                  className="bg-[rgba(0,0,0,0.3)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#00d4c8] focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((key) => (
                    <option key={key} value={key} className="bg-[#061e20] text-white">
                      {DOCUMENT_TYPE_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              {isUploading && (
                <ProgressBar
                  value={uploadProgress}
                  label="Uploading"
                  color="green"
                  size="md"
                />
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)] text-black rounded-xl py-3.5 text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,212,200,0.3)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(0,212,200,0.4)] disabled:bg-[rgba(255,255,255,0.1)] disabled:text-[rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading…
                  </>
                ) : (
                  "Upload Document"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Documents list */}
      {isLoadingDocs ? (
        <div className="flex items-center justify-center py-12 text-[rgba(255,255,255,0.5)] gap-3">
          <Loader2 size={28} className="animate-spin text-[#00d4c8]" />
          <span>Loading documents…</span>
        </div>
      ) : loadError ? (
        <p className="text-center py-12 text-[rgba(255,255,255,0.5)] text-sm">
          Unable to load documents right now. Please try again later.
        </p>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-[rgba(255,255,255,0.5)] gap-3">
          <FileText size={40} className="text-[rgba(0,180,160,0.4)]" aria-hidden="true" />
          <p className="m-0 text-sm">No documents uploaded yet.</p>
        </div>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-3" role="list">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="bg-[rgba(0,0,0,0.2)] border border-[rgba(0,180,160,0.15)] rounded-2xl px-6 py-4 flex items-center gap-4 transition-all hover:border-[rgba(0,212,200,0.3)] hover:bg-[rgba(0,212,200,0.03)] sm:flex-col sm:items-start sm:gap-3"
            >
              <FileText size={20} className="text-[#00d4c8] shrink-0" aria-hidden="true" />

              <div className="flex-1 min-w-0">
                <p className="m-0 text-white font-medium text-sm truncate">{doc.name}</p>
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

              <a
                href={doc.url}
                download={doc.name}
                className="shrink-0 flex items-center gap-1.5 text-[#00d4c8] text-sm font-medium bg-[rgba(0,212,200,0.08)] border border-[rgba(0,212,200,0.2)] rounded-lg px-3 py-1.5 transition-all hover:bg-[rgba(0,212,200,0.15)] hover:border-[rgba(0,212,200,0.4)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,212,200,0.5)]"
                aria-label={`Download ${doc.name}`}
              >
                <Download size={14} />
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default DocumentsSection;
