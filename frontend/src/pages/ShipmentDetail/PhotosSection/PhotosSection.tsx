import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Trash2, X, Upload, CheckCircle2 } from "lucide-react";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { shipmentPhotosApi } from "../../../services/api/endpoints/shipmentPhotos";
import type { PhotoType, ShipmentPhoto } from "../../../types/shipmentPhoto";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_PHOTOS = 10;
const MAX_SIZE_MB = 5;
const PHOTO_TYPES: PhotoType[] = ["PICKUP", "DELIVERY", "DAMAGE", "OTHER"];

const TYPE_STYLES: Record<PhotoType, { pill: string; dot: string }> = {
  PICKUP: { pill: "bg-[#3B82F6]/15 text-[#60a5fa] border border-[#3B82F6]/30", dot: "bg-[#3B82F6]" },
  DELIVERY: { pill: "bg-[#10B981]/15 text-[#34d399] border border-[#10B981]/30", dot: "bg-[#10B981]" },
  DAMAGE: { pill: "bg-[#EF4444]/15 text-[#f87171] border border-[#EF4444]/30", dot: "bg-[#EF4444]" },
  OTHER: { pill: "bg-white/8 text-[#9CA3AF] border border-white/10", dot: "bg-[#9CA3AF]" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Minimal custom type-tag selector — no browser chrome */
const TypeSelect: React.FC<{
  value: PhotoType;
  onChange: (t: PhotoType) => void;
}> = ({ value, onChange }) => {
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

/** Portal-based lightbox — fully independent of parent DOM */
const Lightbox: React.FC<{
  items: { url: string; type: PhotoType; label: string }[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ items, index, onClose, onPrev, onNext }) => {
  const item = items[index];
  if (!item) return null;

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handler);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const s = TYPE_STYLES[item.type];

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="
          absolute top-0 left-0 right-0 flex items-center justify-between
          px-4 py-3 sm:px-3 sm:py-2
        "
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Type pill */}
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide ${s.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {item.type}
        </span>

        {/* Counter */}
        <span className="text-white/40 text-xs font-medium tabular-nums">
          {index + 1} / {items.length}
        </span>

        {/* Close */}
        <button
          onClick={onClose}
          className="
            flex items-center justify-center w-8 h-8 rounded-full
            bg-white/10 hover:bg-white/20 text-white/80 hover:text-white
            transition-all duration-150 active:scale-95
          "
          aria-label="Close lightbox"
        >
          <X size={16} />
        </button>
      </div>

      {/* Image */}
      <div
        className="
          relative w-full flex items-center justify-center
          px-14 py-20 sm:px-10 sm:py-16
          max-w-5xl mx-auto
        "
        style={{ minHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.url}
          alt="Full size shipment photo"
          className="
            max-w-full max-h-[70vh] sm:max-h-[60vh]
            w-auto h-auto object-contain rounded-xl
            shadow-[0_20px_60px_rgba(0,0,0,0.8)]
          "
          draggable={false}
        />

        {/* Prev button */}
        {items.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="
              absolute left-2 sm:left-1 top-1/2 -translate-y-1/2
              flex items-center justify-center
              w-10 h-10 sm:w-8 sm:h-8 rounded-full
              bg-black/60 hover:bg-black/80 border border-white/10
              text-white/80 hover:text-white
              transition-all duration-150 active:scale-95
            "
            aria-label="Previous photo"
          >
            <ChevronLeft size={20} className="sm:w-4 sm:h-4" />
          </button>
        )}

        {/* Next button */}
        {items.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="
              absolute right-2 sm:right-1 top-1/2 -translate-y-1/2
              flex items-center justify-center
              w-10 h-10 sm:w-8 sm:h-8 rounded-full
              bg-black/60 hover:bg-black/80 border border-white/10
              text-white/80 hover:text-white
              transition-all duration-150 active:scale-95
            "
            aria-label="Next photo"
          >
            <ChevronRight size={20} className="sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* Bottom label */}
      <div
        className="
          absolute bottom-0 left-0 right-0 flex items-center justify-center
          px-4 py-4 sm:py-3
          text-white/40 text-xs text-center
        "
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.label}
      </div>

      {/* Thumbnail strip — desktop only, hidden on mobile */}
      {items.length > 1 && (
        <div
          className="
            hidden sm:hidden md:flex
            absolute bottom-14 left-0 right-0
            justify-center gap-2 px-4 flex-wrap
          "
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => {
                // navigate to this index — handled by parent
              }}
              className={`
                w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-150
                ${i === index ? "border-[#00d4c8] opacity-100" : "border-white/20 opacity-50 hover:opacity-80"}
              `}
            >
              <img src={it.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
};

/** Plain dropzone — no internal file list, just triggers onFilesSelected */
const Dropzone: React.FC<{
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}> = ({ onFilesSelected, disabled }) => {
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

// ─── Main Component ───────────────────────────────────────────────────────────

interface PendingPhoto {
  id: string; // local unique id
  file: File;
  previewUrl: string;
  type: PhotoType;
}

interface PhotosSectionProps {
  shipmentId: string;
  canDelete: boolean;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ shipmentId, canDelete }) => {
  const [photos, setPhotos] = useState<ShipmentPhoto[]>([]);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSource, setLightboxSource] = useState<"photos" | "pending">("photos");

  // Delete
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalCount = photos.length + pending.length;
  const atCap = totalCount >= MAX_PHOTOS;

  // ── File selection ──────────────────────────────────────────────────────────
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const slots = MAX_PHOTOS - photos.length - pending.length;
      if (slots <= 0) return;
      const accepted = files.slice(0, slots);
      const newPending: PendingPhoto[] = accepted.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        type: "OTHER",
      }));
      setPending((prev) => [...prev, ...newPending]);
    },
    [photos.length, pending.length],
  );

  const updatePendingType = (id: string, type: PhotoType) => {
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, type } : p)));
  };

  const removePending = (id: string) => {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!pending.length || isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);
    const uploaded: ShipmentPhoto[] = [];
    const failed: string[] = [];

    for (let i = 0; i < pending.length; i++) {
      const p = pending[i];
      try {
        const photo = await shipmentPhotosApi.upload(shipmentId, p.file, p.type);
        uploaded.push(photo);
        URL.revokeObjectURL(p.previewUrl);
      } catch {
        failed.push(p.id);
      }
      setUploadProgress(Math.round(((i + 1) / pending.length) * 100));
    }

    setPhotos((prev) => [...prev, ...uploaded]);
    setPending((prev) => prev.filter((p) => failed.includes(p.id)));
    setIsUploading(false);
    setUploadProgress(0);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await shipmentPhotosApi.delete(shipmentId, deleteTargetId);
      setPhotos((prev) => prev.filter((p) => p.id !== deleteTargetId));
    } catch {
      // production: toast error
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  // ── Lightbox helpers ────────────────────────────────────────────────────────
  const photoItems = photos.map((p) => ({
    url: p.url,
    type: p.type,
    label: `${p.uploaderName} · ${new Date(p.uploadedAt).toLocaleString()}`,
  }));
  const pendingItems = pending.map((p) => ({
    url: p.previewUrl,
    type: p.type,
    label: "Pending upload",
  }));

  const activeLightboxItems = lightboxSource === "photos" ? photoItems : pendingItems;

  const openLightbox = (index: number, source: "photos" | "pending") => {
    setLightboxIndex(index);
    setLightboxSource(source);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const goPrev = () => setLightboxIndex((i) => (i - 1 + activeLightboxItems.length) % activeLightboxItems.length);
  const goNext = () => setLightboxIndex((i) => (i + 1) % activeLightboxItems.length);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <section
        aria-labelledby="photos-section-heading"
        className="
          bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)]
          rounded-3xl mt-8
          md:px-5 md:py-8 sm:px-4 sm:py-6 px-2 py-6 backdrop-blur-md
          shadow-[0_8px_32px_rgba(0,0,0,0.3)] md:rounded-2xl
          
        "
      >
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2
            id="photos-section-heading"
            className="font-['Bebas_Neue',sans-serif] text-[clamp(1.5rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white "
          >
            SHIPMENT <span className="text-[#00d4c8]">PHOTOS</span>
          </h2>
          <p className="mt-1 text-[rgba(200,230,240,0.5)] text-sm">
            Proof-of-delivery, pickup, and damage evidence
            <span className="ml-2 text-white/30 text-xs font-medium tabular-nums">
              ({totalCount}/{MAX_PHOTOS})
            </span>
          </p>
        </div>

        {/* Dropzone */}
        {!atCap && (
          <div className="mb-3 sm:mb-6">
            <Dropzone onFilesSelected={handleFilesSelected} disabled={isUploading} />
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
                    onClick={() => openLightbox(i, "pending")}
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
                      <TypeSelect value={p.type} onChange={(type) => updatePendingType(p.id, type)} />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePending(p.id)}
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
                onClick={handleUpload}
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
              onClick={handleUpload}
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

        {/* ── Uploaded photos grid ── */}
        {photos.length > 0 && (
          <div>
            {pending.length > 0 && <div className="h-px bg-[rgba(0,212,200,0.1)] mb-4 sm:mb-6" />}
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4 sm:mb-3">Uploaded ({photos.length})</p>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-2 sm:gap-2">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="
                    relative flex flex-col
                    rounded-xl overflow-hidden
                    border border-[rgba(0,180,160,0.15)]
                    bg-[rgba(0,0,0,0.3)]
                    group
                  "
                >
                  {/* Thumbnail */}
                  <button
                    type="button"
                    onClick={() => openLightbox(i, "photos")}
                    className="block relative w-full aspect-square overflow-hidden"
                    aria-label={`View photo ${i + 1} full size`}
                  >
                    <img
                      src={photo.url}
                      alt={`Shipment photo ${i + 1}`}
                      className="
                        w-full h-full object-cover
                        transition-transform duration-300
                        group-hover:scale-105
                      "
                    />
                    <div
                      className="
                      absolute inset-0 bg-black/0 group-hover:bg-black/25
                      flex items-center justify-center
                      transition-all duration-200
                    "
                    >
                      <span
                        className="
                        opacity-0 group-hover:opacity-100
                        text-white text-xs font-medium
                        bg-black/60 px-2.5 py-1 rounded-lg
                        transition-opacity duration-200
                      "
                      >
                        View
                      </span>
                    </div>
                  </button>

                  {/* Meta row */}
                  <div
                    className="
                    flex items-center justify-between gap-2
                    px-2 py-2 sm:px-1.5 sm:py-1.5
                    bg-[rgba(0,0,0,0.4)]
                    border-t border-white/5
                  "
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      {/* Type pill — static, not interactive */}
                      <span
                        className={`
                        self-start flex items-center gap-1 px-2 py-0.5
                        rounded-full text-[10px] font-semibold uppercase tracking-wide
                        ${TYPE_STYLES[photo.type].pill}
                      `}
                      >
                        <span className={`w-1 h-1 rounded-full ${TYPE_STYLES[photo.type].dot}`} />
                        {photo.type}
                      </span>
                      <span className="text-[10px] text-white/30 truncate leading-tight mt-0.5">{photo.uploaderName}</span>
                      <span className="text-[10px] text-white/20 truncate leading-tight">{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(photo.id)}
                        className="
                          shrink-0 flex items-center justify-center
                          w-7 h-7 sm:w-6 sm:h-6
                          rounded-lg
                          text-white/25 hover:text-[#f87171]
                          hover:bg-[#EF4444]/10
                          transition-all duration-150 active:scale-90
                        "
                        aria-label={`Delete photo ${i + 1}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {photos.length === 0 && pending.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 sm:py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center text-white/20">
              <Upload size={20} />
            </div>
            <p className="text-white/30 text-sm max-w-xs">No photos yet. Upload proof-of-delivery or damage evidence above.</p>
          </div>
        )}
      </section>

      {/* ── Lightbox (portal) ── */}
      {lightboxOpen && activeLightboxItems.length > 0 && (
        <Lightbox items={activeLightboxItems} index={lightboxIndex} onClose={closeLightbox} onPrev={goPrev} onNext={goNext} />
      )}

      {/* ── Delete confirmation ── */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Photo"
        message="This photo will be permanently removed and cannot be recovered."
        confirmLabel="Delete Photo"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
};

export default PhotosSection;
