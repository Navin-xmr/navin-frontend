import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import FileUpload from "../../../components/ui/FileUpload";
import { shipmentApi } from "../../../services/api/endpoints/shipments";

export interface DeliveryProofUploadProps {
  shipmentId: string;
}

const DeliveryProofUpload: React.FC<DeliveryProofUploadProps> = ({
  shipmentId,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientNameError, setRecipientNameError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const prevPreviewRef = useRef<string | null>(null);

  // Generate a preview URL for the first valid file
  useEffect(() => {
    if (prevPreviewRef.current) {
      URL.revokeObjectURL(prevPreviewRef.current);
      prevPreviewRef.current = null;
    }

    const first = files[0];
    if (first && first.type.startsWith("image/")) {
      const url = URL.createObjectURL(first);
      setPreviewUrl(url);
      prevPreviewRef.current = url;
    } else {
      setPreviewUrl(null);
    }
  }, [files]);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current);
    };
  }, []);

  const handleFilesSelected = (selected: File[]) => {
    setFiles(selected);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!recipientName.trim()) {
      setRecipientNameError("Recipient name is required");
      return;
    }
    if (files.length === 0) return;

    setIsSubmitting(true);
    setUploadProgress(10);

    // Animate progress while the request is in flight
    const interval = setInterval(() => {
      setUploadProgress((prev) =>
        prev === undefined || prev >= 85 ? prev : prev + 15,
      );
    }, 250);

    try {
      await shipmentApi.uploadProof(shipmentId, files[0], recipientName);
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setSubmitted(true);
        setSubmittedAt(new Date());
        setUploadProgress(undefined);
      }, 400);
    } catch {
      clearInterval(interval);
      setUploadProgress(undefined);
      setSubmitError("Failed to upload proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6">
      <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
        DELIVERY <span className="text-[#00d4c8]">PROOF</span>
      </h2>

      {!submitted ? (
        <form
          className="flex flex-col gap-8"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Shared FileUpload component — drag-drop, preview, progress */}
          <FileUpload
            accept={["image/*"]}
            maxSizeMB={10}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            uploadProgress={uploadProgress}
          />

          {/* Inline submit error */}
          {submitError && (
            <p className="text-[#ff3b30] text-sm" role="alert">
              {submitError}
            </p>
          )}

          {/* Recipient Name */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="recipientName"
              className="text-white font-medium text-base"
            >
              Recipient Name
            </label>
            <input
              type="text"
              id="recipientName"
              className="bg-[rgba(0,0,0,0.3)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-xl px-6 py-4 text-white text-base font-[inherit] transition-all w-full focus:outline-none focus:border-[#00d4c8] focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] placeholder:text-[rgba(255,255,255,0.3)]"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                if (e.target.value.trim()) setRecipientNameError("");
              }}
              placeholder="Who signed for this delivery?"
              aria-invalid={!!recipientNameError}
              aria-describedby={
                recipientNameError ? "recipientName-error" : undefined
              }
            />
            {recipientNameError && (
              <span
                id="recipientName-error"
                className="text-[#ff3b30] text-sm"
                role="alert"
              >
                {recipientNameError}
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={files.length === 0 || !recipientName.trim() || isSubmitting}
            className="bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)] text-black border-none rounded-xl py-5 text-[1.1rem] font-semibold font-[inherit] cursor-pointer transition-all flex items-center justify-center mt-4 shadow-[0_4px_15px_rgba(0,212,200,0.3)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(0,212,200,0.4)] disabled:bg-[rgba(255,255,255,0.1)] disabled:text-[rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                Submitting…
              </span>
            ) : (
              "Submit Proof"
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Success banner */}
          <div
            role="status"
            aria-live="polite"
            className="bg-[rgba(0,212,200,0.1)] border border-[rgba(0,212,200,0.3)] text-[#00d4c8] px-6 py-4 rounded-xl flex items-center gap-4 font-medium"
          >
            <CheckCircle2
              size={24}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Delivery proof submitted successfully</span>
          </div>

          {/* Proof details */}
          <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)]">
            {previewUrl && (
              <div className="w-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-8 min-h-50">
                <img
                  src={previewUrl}
                  alt="Submitted delivery proof"
                  className="max-w-full max-h-100 rounded-lg object-contain"
                />
              </div>
            )}
            <div className="px-8 py-6 bg-[rgba(255,255,255,0.02)] grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 items-center md:grid-cols-1 md:gap-y-2">
              <p className="text-[rgba(255,255,255,0.5)] text-[0.9rem] m-0">
                Signed By
              </p>
              <p className="text-white text-[1.1rem] font-medium m-0 md:mb-4">
                {recipientName}
              </p>
              <p className="text-[rgba(255,255,255,0.5)] text-[0.9rem] m-0">
                Timestamp
              </p>
              <p className="text-white text-[1.1rem] font-medium m-0">
                {submittedAt?.toLocaleString() ?? new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProofUpload;
