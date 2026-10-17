import React, { useState, useEffect } from "react";
import { shipmentApi } from "../../../services/api/endpoints/shipments";
import type {
  ShipmentDocument,
  DocumentType,
} from "../../../services/api/endpoints/shipments";
import { useToast } from "../../../context/ToastContext";
import { ALLOWED_TYPES, MAX_SIZE_BYTES } from "./documentUtils";
import DocumentUploadPanel from "./DocumentUploadPanel";
import DocumentList from "./DocumentList";

interface DocumentsSectionProps {
  shipmentId: string;
  userRole: "company" | "customer";
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  shipmentId,
  userRole,
}) => {
  const { addToast } = useToast();

  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>("OTHER");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch the documents attached to this shipment (again on retry)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsLoadingDocs(true);
      setDocsError(false);
      shipmentApi
        .getDocuments(shipmentId)
        .then((docs) => {
          if (!cancelled) setDocuments(docs);
        })
        .catch(() => {
          if (!cancelled) {
            setDocuments([]);
            setDocsError(true);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingDocs(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [shipmentId, reloadKey]);

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
      // Keep the selected file so the user can retry the upload.
      setUploadProgress(0);
      setIsUploading(false);
      addToast("Document upload failed. Please try again.", "error");
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
        <DocumentUploadPanel
          isDragging={isDragging}
          selectedFile={selectedFile}
          selectedType={selectedType}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileInputChange={handleFileInputChange}
          onSelectType={setSelectedType}
          onRemoveSelected={handleRemoveSelected}
          onUpload={handleUpload}
        />
      )}

      {/* Documents list */}
      <DocumentList
        documents={documents}
        isLoading={isLoadingDocs}
        hasError={docsError}
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    </div>
  );
};

export default DocumentsSection;
