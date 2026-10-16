import type { PhotoType } from "@/types/shipmentPhoto";

export interface PendingPhoto {
  id: string; // local unique id
  file: File;
  previewUrl: string;
  type: PhotoType;
}
