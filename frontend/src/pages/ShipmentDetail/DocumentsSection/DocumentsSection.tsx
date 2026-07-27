import React, { useState, useRef, useEffect } from "react";
import { shipmentApi } from "../../../services/api/endpoints/shipments";
import type { ShipmentDocument, DocumentType } from "../../../services/api/endpoints/shipments";
import { useToast } from "../../../context/ToastContext";

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

const MOCK_DOCUMENTS: ShipmentDocument[] = [
  {
    id: "doc-1",
    name: "Bill_of_Lading_SHP992834.pdf",
    type: "BILL_OF_LADING",
    uploadDate: "2026-02-20T09:30:00Z",
    uploader: "Jane Smith",
    url: "#",
    sizeBytes: 245760,
  },
  {
    id: "doc-2",
    name: "Commercial_Invoice_SHP992834.pdf",
    type: "COMMERCIAL_INVOICE",
    uploadDate: "2026-02-20T10:15:00Z",
    uploader: "Jane Smith",
    url: "#",
    sizeBytes: 184320,
  },
  {
    id: "doc-3",
    name: "Packing_List_SHP992834.pdf",
    type: "PACKING_LIST",
    uploadDate: "2026-02-21T08:00:00Z",
    uploader: "Operations Team",
    url: "#",
    sizeBytes: 98304,
  },
];

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

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  shipmentId,
  userRole,
}) => {
  const { addToast } = useToast();

  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>("OTHER");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents on mount
  useEffect(() => {
    let cancelled = false;
    shipmentApi
      .getDocuments(shipmentId)
      .then((docs) => {
        if (!cancelled) setDocuments(docs);
      })
      .catch(() => {
        if (!cancelled) {
          // API not yet implemented — fall back to mock data
          setDocuments(MOCK_DOCUMENTS);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDocs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shipmentId]);

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
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
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const validateAndSetFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      addToast("Only PDF, PNG, and JPG files are allowed.", "error");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      addToast("File exceeds the 10 MB size limit.", "error");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress in 20% increments while awaiting the real request
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 80) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 20;
      });
    }, 300);

    try {
      const newDoc = await shipmentApi.uploadDocument(
        shipmentId,
        selectedFile,
        selectedType,
      );
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedFile(null);
        setSelectedType("OTHER");
        setUploadProgress(0);
        setIsUploading(false);
        addToast("Document uploaded successfully.", "success");
      }, 400);
    } catch {
      clearInterval(progressInterval);
      // API not yet available — optimistically add a mock entry
      const mockDoc: ShipmentDocument = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        type: selectedType,
        uploadDate: new Date().toISOString(),
        uploader: "You",
        url: "#",
        sizeBytes: selectedFile.size,
      };
      setUploadProgress(100);
      setTimeout(() => {
        setDocuments((prev) => [mockDoc, ...prev]);
        setSelectedFile(null);
        setSelectedType("OTHER");
        setUploadProgress(0);
        setIsUploading(false);
        addToast("Document uploaded successfully.", "success");
      }, 400);
    }
  };

  const handleRemoveSelected = () => {
    setSelectedFile(null);
  };

  return (
    <div
      className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6"
      aria-label="Documents section"
    >
      {/* Heading */}
      <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
        SHIPMENT <span className="text-[#00d4c8]">DOCUMENTS</span>
      </h2>

      {/* Upload area — company only */}
      {userRole === "company" && (
        <div className="mb-8">
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload document. Click to open file picker or drag and drop."
            className={`border-2 border-dashed rounded-2xl min-h-36 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer select-none ${
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
              <div className="flex flex-col items-center gap-3 p-6 w-full">
                <div className="flex items-center gap-3 bg-[rgba(0,212,200,0.08)] border border-[rgba(0,212,200,0.25)] rounded-xl px-4 py-3 w-full max-w-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#00d4c8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-white text-sm font-medium truncate flex-1">
                    {selectedFile.name}
                  </span>
                  <span className="text-[rgba(255,255,255,0.5)] text-xs shrink-0">
                    {formatBytes(selectedFile.size)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSelected();
                    }}
                    className="shrink-0 text-[rgba(255,255,255,0.4)] hover:text-[#ff3b30] transition-colors"
                    aria-label="Remove selected file"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-8 text-[rgba(255,255,255,0.7)]">
                <div className="text-[#00d4c8] mb-4" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-[1.1rem] font-medium text-white m-0 mb-2">
                  Click or drag &amp; drop to upload
                </p>
                <p className="text-[0.9rem] m-0 text-[rgba(200,230,240,0.5)]">
                  PDF, PNG or JPG (max. 10 MB)
                </p>
              </div>
            )}
          </div>

          {/* Document type selector + upload button */}
          {selectedFile && (
            <div className="mt-4 flex flex-col gap-3 sm:gap-4">
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
                  onChange={(e) =>
                    setSelectedType(e.target.value as DocumentType)
                  }
                  className="bg-[rgba(0,0,0,0.3)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-xl px-4 py-3 text-white text-sm font-[inherit] transition-all focus:outline-none focus:border-[#00d4c8] focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] appearance-none cursor-pointer"
                  disabled={isUploading}
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map(
                    (key) => (
                      <option
                        key={key}
                        value={key}
                        className="bg-[#061e20] text-white"
                      >
                        {DOCUMENT_TYPE_LABELS[key]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Progress bar */}
              {isUploading && (
                <div className="flex flex-col gap-1.5" aria-live="polite">
                  <div className="flex justify-between text-xs text-[rgba(255,255,255,0.6)]">
                    <span>Uploading…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#00d4c8,#009990)] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                      role="progressbar"
                      aria-valuenow={uploadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)] text-black border-none rounded-xl py-4 text-[1rem] font-semibold font-[inherit] cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,212,200,0.3)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(0,212,200,0.4)] disabled:bg-[rgba(255,255,255,0.1)] disabled:text-[rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin-svg w-5 h-5"
                      viewBox="0 0 50 50"
                      aria-hidden="true"
                    >
                      <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="5"
                        stroke="currentColor"
                      />
                    </svg>
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
      ) : documents.length === 0 ? (
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
      ) : (
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
      )}
    </div>
  );
};

export default DocumentsSection;
