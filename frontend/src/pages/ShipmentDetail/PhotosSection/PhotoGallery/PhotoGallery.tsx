import React from "react";
import { Trash2, Upload } from "lucide-react";
import type { ShipmentPhoto } from "@/types/shipmentPhoto";
import { TYPE_STYLES } from "../photoConstants";

export interface PhotoGalleryProps {
  photos: ShipmentPhoto[];
  hasPending: boolean;
  canDelete: boolean;
  onPreview: (index: number) => void;
  onDelete: (id: string) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, hasPending, canDelete, onPreview, onDelete }) => (
  <>
    {/* ── Uploaded photos grid ── */}
    {photos.length > 0 && (
      <div>
        {hasPending && <div className="h-px bg-[rgba(0,212,200,0.1)] mb-4 sm:mb-6" />}
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
                onClick={() => onPreview(i)}
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
                    onClick={() => onDelete(photo.id)}
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
    {photos.length === 0 && !hasPending && (
      <div className="flex flex-col items-center gap-3 py-8 sm:py-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center text-white/20">
          <Upload size={20} />
        </div>
        <p className="text-white/30 text-sm max-w-xs">No photos yet. Upload proof-of-delivery or damage evidence above.</p>
      </div>
    )}
  </>
);

export default PhotoGallery;
