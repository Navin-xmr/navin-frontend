import React, { useRef } from "react";
import type { DocumentType } from "../../../services/api/endpoints/shipments";
import { DOCUMENT_TYPE_LABELS } from "./documentUtils";
import DocumentPreview from "./DocumentPreview";

export interface DocumentUploadPanelProps {
  isDragging: boolean;
  selectedFile: File | null;
  selectedType: DocumentType;
  isUploading: boolean;
  uploadProgress: number;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectType: (type: DocumentType) => void;
  onRemoveSelected: () => void;
  onUpload: () => void;
}

const DocumentUploadPanel: React.FC<DocumentUploadPanelProps> = ({
  isDragging,
  selectedFile,
  selectedType,
  isUploading,
  uploadProgress,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onSelectType,
  onRemoveSelected,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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
          onChange={onFileInputChange}
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          aria-label="Select document file"
        />

        {selectedFile ? (
          <DocumentPreview file={selectedFile} onRemove={onRemoveSelected} />
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
              onChange={(e) => onSelectType(e.target.value as DocumentType)}
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
            onClick={onUpload}
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
  );
};

export default DocumentUploadPanel;
