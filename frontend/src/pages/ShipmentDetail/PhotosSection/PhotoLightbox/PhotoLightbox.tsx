import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2, AlertTriangle, Loader2 } from "lucide-react";
import type { PhotoType } from "@/types/shipmentPhoto";
import { TYPE_STYLES } from "../photoConstants";

/** Portal-based lightbox — fully independent of parent DOM */
export interface PhotoLightboxProps {
  items: { url: string; type: PhotoType; label: string }[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onNavigate?: (idx: number) => void;
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ items, index, onClose, onPrev, onNext, onNavigate }) => {
  // ── Zoom / loading state ──────────────────────────────────────────────
  // Remounted per `index` (see `key` at the call site) so zoom/loaded/error
  // reset automatically when navigating to a different photo.
  const [zoom, setZoom] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ── Touch swipe ───────────────────────────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) (diff > 0 ? onPrev() : onNext());
    touchStartX.current = null;
  };

  // ── Keyboard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === "0") setZoom(1);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";

    // Auto-close after 30 minutes to prevent stuck overlays
    const autoCloseTimer = setTimeout(() => {
      console.warn('[PhotosSection] Auto-closing lightbox due to timeout');
      onClose();
    }, 30 * 60 * 1000);

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      clearTimeout(autoCloseTimer);
    };
  }, [onClose, onPrev, onNext]);

  const item = items[index];
  if (!item) return null;
  const s = TYPE_STYLES[item.type];

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center select-none"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 sm:px-3 sm:py-2"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide ${s.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {item.type}
        </span>
        <span className="text-white/40 text-xs font-medium tabular-nums">{index + 1} / {items.length}</span>
        <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-150 active:scale-95" aria-label="Close lightbox">
          <X size={16} />
        </button>
      </div>

      {/* ── Image area ───────────────────────────────────────────────── */}
      <div
        className="relative w-full flex items-center justify-center px-14 py-20 sm:px-10 sm:py-16 max-w-5xl mx-auto"
        style={{ minHeight: "100vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={36} className="text-white/40 animate-spin" aria-label="Loading image" />
          </div>
        )}

        {imgError && (
          <div className="flex flex-col items-center gap-3 text-white/50">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <AlertTriangle size={28} className="text-[#f87171]" />
            </div>
            <p className="text-sm">Failed to load image</p>
            <button type="button" onClick={() => { setImgError(false); setImgLoaded(false); }} className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
              Retry
            </button>
          </div>
        )}

        <img
          src={item.url}
          alt={`Shipment photo - ${item.type}`}
          className={`max-w-full max-h-[70vh] sm:max-h-[60vh] w-auto h-auto object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-transform duration-200 ease-out ${!imgLoaded && !imgError ? "opacity-0 absolute" : "opacity-100"}`}
          style={{ transform: `scale(${zoom})` }}
          draggable={false}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} disabled={zoom <= 0.5}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" aria-label="Zoom out">
            <ZoomOut size={14} />
          </button>
          <span className="min-w-[36px] text-center text-[11px] text-white/50 font-medium tabular-nums">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} disabled={zoom >= 3}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" aria-label="Zoom in">
            <ZoomIn size={14} />
          </button>
          <button type="button" onClick={() => setZoom(1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer" aria-label="Reset zoom">
            <Maximize2 size={12} />
          </button>
        </div>

        {items.length > 1 && (
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 sm:left-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white/80 hover:text-white transition-all duration-150 active:scale-95 cursor-pointer"
            aria-label="Previous photo">
            <ChevronLeft size={20} className="sm:w-4 sm:h-4" />
          </button>
        )}
        {items.length > 1 && (
          <button onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 sm:right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white/80 hover:text-white transition-all duration-150 active:scale-95 cursor-pointer"
            aria-label="Next photo">
            <ChevronRight size={20} className="sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* ── Bottom label ─────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-4 py-4 sm:py-3 text-white/40 text-xs text-center"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.label}
      </div>

      {/* ── Thumbnail strip ──────────────────────────────────────────── */}
      {items.length > 1 && (
        <div className="hidden sm:hidden md:flex absolute bottom-14 left-0 right-0 justify-center px-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
            {items.map((it, i) => (
              <button key={i} onClick={() => onNavigate?.(i)}
                className={`shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-150 cursor-pointer ${i === index ? "border-[#00d4c8] opacity-100 ring-1 ring-[#00d4c8]/30" : "border-white/20 opacity-50 hover:opacity-80"}`}
                aria-label={`Go to photo ${i + 1}`}>
                <img src={it.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
};

export default PhotoLightbox;
