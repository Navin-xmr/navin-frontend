import React, { useState, useRef } from "react";
import { AlertTriangle, Upload, FileText, CheckCircle, X } from "lucide-react";
import { apiClient } from "../../../../services/api/client";

export type DisputeType = "WRONG_GOODS" | "DAMAGED" | "NOT_DELIVERED" | "PAYMENT_DISAGREEMENT" | "OTHER";

export interface DisputeData {
  referenceNumber: string;
  status: string;
  createdAt: string;
  type: DisputeType;
  description: string;
  resolutionEstimate?: string;
}

export interface DisputeFormProps {
  shipmentId: string;
  existingDispute?: DisputeData | null;
  onClose: () => void;
  onSuccess?: (dispute: DisputeData) => void;
}

const DISPUTE_TYPES: { value: DisputeType; label: string }[] = [
  { value: "WRONG_GOODS", label: "Wrong Goods" },
  { value: "DAMAGED", label: "Damaged Cargo" },
  { value: "NOT_DELIVERED", label: "Not Delivered" },
  { value: "PAYMENT_DISAGREEMENT", label: "Payment Disagreement" },
  { value: "OTHER", label: "Other" },
];

const DisputeForm: React.FC<DisputeFormProps> = ({
  shipmentId,
  existingDispute,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"form" | "submitting" | "success">(
    existingDispute ? "success" : "form"
  );
  const [type, setType] = useState<DisputeType>("WRONG_GOODS");
  const [description, setDescription] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ description?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [disputeResult, setDisputeResult] = useState<DisputeData | null>(existingDispute ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: { description?: string } = {};
    if (description.trim().length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStep("submitting");
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("description", description);
      if (evidenceFile) {
        formData.append("evidence", evidenceFile);
      }

      const res = await apiClient.post<{ data: DisputeData }>(
        `/api/shipments/${shipmentId}/disputes`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setDisputeResult(res.data.data);
      setStep("success");
      onSuccess?.(res.data.data);
    } catch {
      setSubmitError("Failed to submit dispute. Please try again.");
      setStep("form");
    }
  };

  const handleRemoveFile = () => {
    setEvidenceFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (step === "success" && disputeResult) {
    return (
      <div className="bg-background-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {existingDispute ? "Existing Dispute" : "Dispute Submitted"}
            </h3>
            <p className="text-sm text-text-secondary">
              Reference: <span className="font-mono text-primary">{disputeResult.referenceNumber}</span>
            </p>
          </div>
        </div>
        <div className="bg-[rgba(0,217,255,0.05)] border border-[rgba(0,217,255,0.15)] rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              disputeResult.status === "OPEN"
                ? "bg-amber-500/20 text-amber-400"
                : disputeResult.status === "RESOLVED"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-blue-500/20 text-blue-400"
            }`}>
              {disputeResult.status}
            </span>
            <span className="text-xs text-text-secondary">{disputeResult.type.replace(/_/g, " ")}</span>
          </div>
          <p className="text-sm text-text-secondary mb-1">{disputeResult.description}</p>
          {disputeResult.resolutionEstimate && (
            <p className="text-xs text-text-secondary mt-2">
              Estimated resolution: {disputeResult.resolutionEstimate}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-lg bg-background-elevated border border-border hover:bg-background-card text-white font-semibold transition-colors duration-200"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-background-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Raise a Dispute</h3>
          <p className="text-sm text-text-secondary">Submit a dispute for shipment {shipmentId}</p>
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="dispute-type" className="block text-sm font-medium text-text-secondary mb-2">
          Dispute Type
        </label>
        <select
          id="dispute-type"
          value={type}
          onChange={(e) => setType(e.target.value as DisputeType)}
          className="w-full px-4 py-3 rounded-lg bg-background-elevated border border-border text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
        >
          {DISPUTE_TYPES.map((dt) => (
            <option key={dt.value} value={dt.value}>
              {dt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label htmlFor="dispute-description" className="block text-sm font-medium text-text-secondary mb-2">
          Description <span className="text-amber-400">*</span>
        </label>
        <textarea
          id="dispute-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description && e.target.value.trim().length >= 50) {
              setErrors({});
            }
          }}
          placeholder="Describe the issue in detail (minimum 50 characters)..."
          rows={5}
          className={`w-full px-4 py-3 rounded-lg bg-background-elevated border text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none ${
            errors.description ? "border-red-500" : "border-border"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-red-400 mt-1">{errors.description}</p>
        )}
        <p className="text-xs text-text-secondary mt-1">
          {description.length}/50 characters minimum
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Evidence File (optional)
        </label>
        {evidenceFile ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background-elevated border border-border">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <span className="flex-1 text-sm text-white truncate">{evidenceFile.name}</span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="shrink-0 text-text-secondary hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary text-text-secondary hover:text-primary text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload PDF or Image
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </div>

      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 rounded-lg bg-background-elevated border border-border hover:bg-background-card text-white font-semibold transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={step === "submitting"}
          className="flex-1 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white font-semibold transition-colors duration-200"
        >
          {step === "submitting" ? "Submitting..." : "Submit Dispute"}
        </button>
      </div>
    </form>
  );
};

export default DisputeForm;
