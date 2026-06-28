export type PhotoType = "PICKUP" | "DELIVERY" | "DAMAGE" | "OTHER";

export interface ShipmentPhoto {
  id: string;
  url: string;
  type: PhotoType;
  uploadedAt: string;
  uploaderName: string;
}
