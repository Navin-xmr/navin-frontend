import React, { useState, useRef } from "react";
import "./DeliveryProofUpload.css";

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    setFile(selectedFile);
    // Use URL.createObjectURL for preview as specified
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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

    if (!file || !recipientName.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call for submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="delivery-proof-section">
      <h2 className="milestone-section-title">
        DELIVERY <span className="milestone-section-title-accent">PROOF</span>
      </h2>

      {!submitted ? (
        <form className="delivery-proof-form" onSubmit={handleSubmit}>
          <div
            className={`file-upload-area ${isDragging ? "dragging" : ""} ${previewUrl ? "has-preview" : ""}`}
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
              className="hidden-file-input"
            />

            {previewUrl ? (
              <div className="preview-container">
                <img
                  src={previewUrl}
                  alt="Delivery Proof Preview"
                  className="proof-image-preview"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeFile}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon">
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p className="upload-text-main">
                  Click or drag & drop to upload
                </p>
                <p className="upload-text-sub">
                  SVG, PNG, JPG or GIF (max. 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="recipientName" className="input-label">
              Recipient Name
            </label>
            <input
              type="text"
              id="recipientName"
              className="recipient-input"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Who signed for this delivery?"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-proof-btn"
            disabled={!file || !recipientName.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading-state">
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle
                    className="path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="5"
                  ></circle>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Proof"
            )}
          </button>
        </form>
      ) : (
        <div className="delivery-proof-readonly">
          <div className="success-banner">
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
              className="success-icon"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Delivery proof submitted successfully</span>
          </div>

          <div className="proof-details-card">
            <div className="proof-image-display">
              {previewUrl && (
                <img src={previewUrl} alt="Submitted Delivery Proof" />
              )}
            </div>

            <div className="proof-info">
              <p className="proof-label">Signed By</p>
              <p className="proof-value">{recipientName}</p>

              <p className="proof-label">Timestamp</p>
              <p className="proof-value">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProofUpload;
