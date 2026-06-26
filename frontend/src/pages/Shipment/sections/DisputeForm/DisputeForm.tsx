import React, { useRef, useState } from 'react';
import axios from 'axios';

export type DisputeType =
  | 'WRONG_GOODS'
  | 'DAMAGED'
  | 'NOT_DELIVERED'
  | 'PAYMENT_DISAGREEMENT'
  | 'OTHER';

export interface ExistingDispute {
  referenceNumber: string;
  status: string;
  createdAt: string;
}

export interface DisputeFormProps {
  shipmentId: string;
  existingDispute?: ExistingDispute;
  onSuccess?: (referenceNumber: string) => void;
}

const DISPUTE_TYPES: { value: DisputeType; label: string }[] = [
  { value: 'WRONG_GOODS', label: 'Wrong Goods Delivered' },
  { value: 'DAMAGED', label: 'Goods Damaged' },
  { value: 'NOT_DELIVERED', label: 'Not Delivered' },
  { value: 'PAYMENT_DISAGREEMENT', label: 'Payment Disagreement' },
  { value: 'OTHER', label: 'Other' },
];

const DisputeForm: React.FC<DisputeFormProps> = ({ shipmentId, existingDispute, onSuccess }) => {
  const [type, setType] = useState<DisputeType>('WRONG_GOODS');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [estimatedResolution, setEstimatedResolution] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (existingDispute) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm">
        <p className="font-semibold text-amber-400 mb-2">Dispute Already Filed</p>
        <div className="space-y-1 text-slate-300">
          <p><span className="text-slate-500">Reference:</span> <span className="font-mono">{existingDispute.referenceNumber}</span></p>
          <p><span className="text-slate-500">Status:</span> {existingDispute.status}</p>
          <p><span className="text-slate-500">Filed:</span> {new Date(existingDispute.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  if (successRef) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm">
        <p className="font-semibold text-emerald-400 mb-2">Dispute Submitted</p>
        <p className="text-slate-300 mb-1">Reference number: <span className="font-mono text-white">{successRef}</span></p>
        {estimatedResolution && (
          <p className="text-slate-400">Estimated resolution: {estimatedResolution}</p>
        )}
      </div>
    );
  }

  const descriptionValid = description.trim().length >= 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descriptionValid) return;
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('description', description.trim());
      if (file) formData.append('evidence', file);

      const res = await axios.post<{
        data: { referenceNumber: string; estimatedResolutionDays?: number };
      }>(`/api/shipments/${shipmentId}/disputes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const ref = res.data.data.referenceNumber;
      const days = res.data.data.estimatedResolutionDays;
      setSuccessRef(ref);
      setEstimatedResolution(days ? `${days} business days` : '5–10 business days');
      onSuccess?.(ref);
    } catch {
      setError('Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm" noValidate>
      {/* Dispute Type */}
      <div>
        <label htmlFor="dispute-type" className="block text-slate-400 mb-1.5">
          Dispute Type <span className="text-red-400">*</span>
        </label>
        <select
          id="dispute-type"
          value={type}
          onChange={(e) => setType(e.target.value as DisputeType)}
          required
          className="w-full bg-white/3 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
        >
          {DISPUTE_TYPES.map((dt) => (
            <option key={dt.value} value={dt.value} className="bg-[#1a2030]">{dt.label}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="dispute-description" className="block text-slate-400 mb-1.5">
          Description <span className="text-red-400">*</span>
          <span className="text-slate-600 ml-1">(min 50 characters)</span>
        </label>
        <textarea
          id="dispute-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          required
          minLength={50}
          placeholder="Please describe the issue in detail…"
          className="w-full bg-white/3 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors resize-y"
        />
        <p className={`text-xs mt-1 ${descriptionValid ? 'text-emerald-400' : 'text-slate-500'}`}>
          {description.trim().length} / 50 characters minimum
        </p>
      </div>

      {/* Evidence Upload */}
      <div>
        <label className="block text-slate-400 mb-1.5">Evidence (optional)</label>
        <div
          className="border border-dashed border-white/10 rounded-lg px-4 py-3 text-slate-500 text-xs cursor-pointer hover:border-white/20 transition-colors"
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        >
          {file ? (
            <span className="text-slate-300">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          ) : (
            'Click to upload PDF or image (max 10 MB)'
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !descriptionValid}
        className="w-full py-2.5 bg-red-500/80 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
      >
        {submitting ? 'Submitting…' : 'Submit Dispute'}
      </button>
    </form>
  );
};

export default DisputeForm;
