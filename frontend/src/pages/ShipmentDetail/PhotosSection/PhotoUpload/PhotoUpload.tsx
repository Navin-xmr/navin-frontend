import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";
import type { PhotoType } from "@/types/shipmentPhoto";
import { MAX_PHOTOS, MAX_SIZE_MB, PHOTO_TYPES, TYPE_STYLES } from "../photoConstants";
import type { PendingPhoto } from "../types";

/** Minimal custom type-tag selector — no browser chrome */
export interface TypeSelectProps {
  value: PhotoType;
  onChange: (t: PhotoType) => void;
}

const TypeSelect: React.FC<TypeSelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const styles = TYPE_STYLES[value];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          flex items-center sm:gap-3 gap-1.5 sm:px-2.5 px-1.5 py-1.5 sm:rounded-lg rounded-md text-[11px] font-semibold
          tracking-wide uppercase transition-all duration-150 select-none
          ${styles.pill}
          hover:brightness-110
        `}
      >
        <span className={`max-sm:hidden w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        <span className="leading-none">{value}</span>
        <svg className={`ml-auto w-3 h-3 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="
            absolute sm:bottom-full mb-1.5 left-0 z-[60]
            bg-[#0F1419] border border-[#1E2433] sm:rounded-lg rounded-md
            shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-1
            min-w-[130px] py-1
          "
        >
          {PHOTO_TYPES.map((type) => {
            const s = TYPE_STYLES[type];
            return (
              <button
                key={type}
                role="option"
                aria-selected={type === value}
                type="button"
                onClick={() => {
                  onChange(type);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold
                  uppercase tracking-wide transition-colors duration-100 text-left
                  ${type === value ? "bg-white/8 text-white" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"}
                `}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                {type}
                {type === value && <CheckCircle2 size={12} className="ml-auto text-[#00d4c8]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** Plain dropzone — no internal file list, just triggers onFilesSelected */
export interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => {
        if (!f.type.startsWith("image/")) return false;
        if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
        return true;
      });
      if (files.length) onFilesSelected(files);
    },
    [onFilesSelected],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Upload photos. Click or drag and drop image files here."
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!disabled) processFiles(e.dataTransfer.files);
      }}
      className={`
        flex flex-col items-center justify-center gap-3
        rounded-2xl border-2 border-dashed
        px-6 py-10 sm:py-8 sm:px-4
        cursor-pointer select-none outline-none
        transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-[#00d4c8] focus-visible:ring-offset-2
        focus-visible:ring-offset-transparent
        ${
          disabled
            ? "border-white/10 opacity-40 cursor-not-allowed"
            : isDragOver
              ? "border-[#00d4c8] bg-[rgba(0,212,200,0.06)] scale-[1.01]"
              : "border-[rgba(0,180,160,0.3)] hover:border-[#00d4c8] hover:bg-[rgba(0,212,200,0.04)]"
        }
      `}
    >
      <div
        className={`
        flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200
        ${isDragOver ? "bg-[rgba(0,212,200,0.15)] text-[#00d4c8]" : "bg-white/5 text-white/40"}
      `}
      >
        <Upload size={22} />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-white/80">{isDragOver ? "Drop photos here" : "Drag & drop photos here"}</p>
        <p className="mt-1 text-xs text-white/40">
          or <span className="text-[#00d4c8] underline underline-offset-2 font-medium">click to browse</span>
        </p>
        <p className="mt-2 text-[11px] text-white/25">Images only · Max {MAX_SIZE_MB} MB each</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) {
            processFiles(e.target.files);
            e.target.value = "";
          }
        }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};

export interface PhotoUploadProps {
  atCap: boolean;
  pending: PendingPhoto[];
  isUploading: boolean;
  uploadProgress: number;
  onFilesSelected: (files: File[]) => void;
  onPendingTypeChange: (id: string, type: PhotoType) => void;
  onRemovePending: (id: string) => void;
  onUpload: () => void;
  onPreview: (index: number) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  atCap,
  pending,
  isUploading,
  uploadProgress,
  onFilesSelected,
  onPendingTypeChange,
  onRemovePending,
  onUpload,
  onPreview,
}) => (
  <>
    {/* Dropzone */}
    {!atCap && (
      <div className="mb-3 sm:mb-6">
        <Dropzone onFilesSelected={onFilesSelected} disabled={isUploading} />
      </div>
    )}

    {atCap && (
      <div className="mb-4 sm:mb-6 rounded-xl border border-[rgba(0,212,200,0.2)] bg-[rgba(0,212,200,0.05)] px-4 py-3 text-center text-xs text-[#00d4c8]/70">
        Maximum of {MAX_PHOTOS} photos reached. Delete a photo to add more.
      </div>
    )}

    {/* ── Pending grid ── */}
    {pending.length > 0 && (
      <div className="mb-4 sm:mb-6">
        {/* Progress bar */}
        {isUploading && (
          <div className="mb-4 sm:mb-3 rounded-xl bg-white/5 px-4 py-3">
            <div className="flex justify-between items-center mb-2 text-xs text-white/50">
              <span>Uploading photos…</span>
              <span className="tabular-nums font-medium text-white/70">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#00d4c8] to-[#009990] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">
          {pending.map((p, i) => (
            <div
              key={p.id}
              className="
                relative flex flex-col
                sm:rounded-lg rounded-md
                border border-[rgba(0,180,160,0.2)]
                bg-[rgba(0,0,0,0.3)]
                group
              "
            >
              {/* Thumbnail */}
              <button
                type="button"
                onClick={() => onPreview(i)}
                className="block relative w-full aspect-square overflow-hidden"
                aria-label={`Preview pending photo ${i + 1}`}
              >
                <img
                  src={p.previewUrl}
                  alt={`Pending photo ${i + 1}`}
                  className="
                    w-full h-full object-cover
                    transition-transform duration-300
                    group-hover:scale-105 sm:rounded-lg rounded-md
                  "
                />
                {/* Hover overlay */}
                <div
                  className="
                  absolute inset-0 bg-black/0 group-hover:bg-black/30
                  flex items-center justify-center
                  transition-all duration-200
                "
                >
                  <span
                    className="
                    opacity-0 group-hover:opacity-100
                    text-white text-xs font-medium
                    bg-black/60 px-2.5 py-1 sm:rounded-lg rounded-md
                    transition-opacity duration-200
                  "
                  >
                    Preview
                  </span>
                </div>
              </button>

              {/* Controls row — type selector + remove */}
              <div
                className="
                flex flex-wrap items-center justify-between gap-2
                px-2 py-2 sm:px-1.5 sm:py-1.5
                bg-[rgba(0,0,0,0.4)]
                border-t border-white/5 sm:rounded-b-lg rounded-b-md
              "
              >
                <div className="flex-1 min-w-0">
                  <TypeSelect value={p.type} onChange={(type) => onPendingTypeChange(p.id, type)} />
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePending(p.id)}
                  className="
                    shrink-0 flex items-center justify-center
                    w-7 h-7 sm:w-6 sm:h-6 rounded-lg
                    text-white/30 hover:text-[#f87171]
                    bg-gray-100/5 hover:bg-[#EF4444]/10
                    transition-all duration-150 active:scale-90
                  "
                  aria-label={`Remove pending photo ${i + 1}`}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 sm:mb-3 gap-3 flex-wrap">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Ready to upload ({pending.length})</p>
          {/* Upload button — in the header row on desktop, full-width below on mobile */}
          <button
            onClick={onUpload}
            disabled={isUploading}
            className="
              hidden sm:hidden md:flex
              items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black
              bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)]
              shadow-[0_4px_15px_rgba(0,212,200,0.25)]
              hover:shadow-[0_6px_20px_rgba(0,212,200,0.4)]
              hover:-translate-y-px transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
            "
          >
            <Upload size={15} />
            {isUploading ? `Uploading…` : `Upload ${pending.length}`}
          </button>
        </div>

        {/* Upload button — full width on mobile */}
        <button
          onClick={onUpload}
          disabled={isUploading}
          className="
            mt-4 sm:mt-3 w-full
            md:hidden
            flex items-center justify-center gap-2
            py-3.5 rounded-xl text-sm font-semibold text-black
            bg-[linear-gradient(135deg,#00d4c8_0%,#009990_100%)]
            shadow-[0_4px_15px_rgba(0,212,200,0.25)]
            hover:shadow-[0_6px_20px_rgba(0,212,200,0.4)]
            hover:-translate-y-px transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
          "
        >
          <Upload size={16} />
          {isUploading ? `Uploading… ${uploadProgress}%` : `Upload ${pending.length} Photo${pending.length > 1 ? "s" : ""}`}
        </button>
      </div>
    )}

  </>
);

export default PhotoUpload;
