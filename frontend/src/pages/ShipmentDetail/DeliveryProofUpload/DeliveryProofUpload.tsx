import React, { useState, useRef } from "react";

const DeliveryProofUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
  };

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    // ADD THIS: Cleanup the previous URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !recipientName.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6">
      <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
        DELIVERY <span className="text-[#00d4c8]">PROOF</span>
      </h2>

      {!submitted ? (
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          {/* Upload area */}
          <div
            className={`border-2 border-dashed rounded-2xl min-h-[250px] flex items-center justify-center bg-[rgba(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden sm:min-h-[200px] ${
              previewUrl ? "border-solid cursor-default p-4" : "cursor-pointer"
            } ${
              isDragging
                ? "border-[#00d4c8] bg-[rgba(0,212,200,0.05)]"
                : "border-[rgba(0,212,200,0.3)] hover:border-[#00d4c8] hover:bg-[rgba(0,212,200,0.05)]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!previewUrl ? triggerFileInput : undefined}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />
            {previewUrl ? (
              <div className="w-full h-full flex flex-col items-center gap-4">
                <img
                  src={previewUrl}
                  alt="Delivery Proof Preview"
                  className="max-w-full max-h-[300px] rounded-lg object-contain"
                />
                <button
                  type="button"
                  className="bg-[rgba(255,59,48,0.1)] text-[#ff3b30] border border-[rgba(255,59,48,0.3)] px-6 py-2 rounded-lg text-[0.9rem] font-medium cursor-pointer transition-all hover:bg-[rgba(255,59,48,0.2)] hover:border-[#ff3b30]"
                  onClick={removeFile}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center text-[rgba(255,255,255,0.7)]">
                <div className="text-[#00d4c8] mb-4">
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
                  Click or drag & drop to upload
                </p>
                <p className="text-[0.9rem] m-0 text-[rgba(200,230,240,0.5)]">
                  SVG, PNG, JPG or GIF (max. 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Recipient input */}
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
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Who signed for this delivery?"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)] text-black border-none rounded-xl py-5 text-[1.1rem] font-semibold font-[inherit] cursor-pointer transition-all flex items-center justify-center mt-4 shadow-[0_4px_15px_rgba(0,212,200,0.3)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(0,212,200,0.4)] disabled:bg-[rgba(255,255,255,0.1)] disabled:text-[rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:shadow-none"
            disabled={!file || !recipientName.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin-svg w-6 h-6" viewBox="0 0 50 50">
                  <circle
                    className="animate-dash"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="5"
                    stroke="currentColor"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Proof"
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Success banner */}
          <div className="bg-[rgba(0,212,200,0.1)] border border-[rgba(0,212,200,0.3)] text-[#00d4c8] px-6 py-4 rounded-xl flex items-center gap-4 font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Delivery proof submitted successfully</span>
          </div>

          {/* Proof details */}
          <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)]">
            <div className="w-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-8 min-h-[200px]">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Submitted Delivery Proof"
                  className="max-w-full max-h-[400px] rounded-lg object-contain"
                />
              )}
            </div>
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
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProofUpload;
