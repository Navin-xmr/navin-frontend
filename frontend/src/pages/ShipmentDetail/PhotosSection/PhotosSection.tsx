import React, { useState, useCallback, useEffect } from "react";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { shipmentPhotosApi } from "@services/api/endpoints/shipmentPhotos";
import type { PhotoType, ShipmentPhoto } from "@/types/shipmentPhoto";
import PhotoUpload from "./PhotoUpload";
import PhotoGallery from "./PhotoGallery";
import PhotoLightbox from "./PhotoLightbox";
import { MAX_PHOTOS } from "./photoConstants";
import type { PendingPhoto } from "./types";

export interface PhotosSectionProps {
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

  // ── Safety: Reset body.overflow if lightbox closes or component unmounts ────
  useEffect(() => {
    if (lightboxOpen) return;
    // Ensure body overflow is reset when lightbox is closed
    document.body.style.overflow = "";
  }, [lightboxOpen]);

  // Safety: Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

        <PhotoUpload
          atCap={atCap}
          pending={pending}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onFilesSelected={handleFilesSelected}
          onPendingTypeChange={updatePendingType}
          onRemovePending={removePending}
          onUpload={handleUpload}
          onPreview={(index) => openLightbox(index, "pending")}
        />

        <PhotoGallery
          photos={photos}
          hasPending={pending.length > 0}
          canDelete={canDelete}
          onPreview={(index) => openLightbox(index, "photos")}
          onDelete={setDeleteTargetId}
        />
      </section>

      {/* ── Lightbox (portal) ── */}
      {lightboxOpen && activeLightboxItems.length > 0 && (
        <PhotoLightbox key={lightboxIndex} items={activeLightboxItems} index={lightboxIndex} onClose={closeLightbox} onPrev={goPrev} onNext={goNext} onNavigate={setLightboxIndex} />
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
