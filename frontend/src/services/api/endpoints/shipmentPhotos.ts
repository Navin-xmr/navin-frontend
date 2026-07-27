import { apiClient } from "../client";
import type { PhotoType, ShipmentPhoto } from "../../../types/shipmentPhoto";

export const shipmentPhotosApi = {
  getAll: async (shipmentId: string): Promise<ShipmentPhoto[]> => {
    const res = await apiClient.get<{ data: ShipmentPhoto[] }>(`/shipments/${shipmentId}/photos`);
    return res.data.data;
  },

  upload: async (shipmentId: string, file: File, type: PhotoType): Promise<ShipmentPhoto> => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    const res = await apiClient.post<{ data: ShipmentPhoto }>(`/shipments/${shipmentId}/photos`, form, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.data;
  },

  delete: async (shipmentId: string, photoId: string): Promise<void> => {
    await apiClient.delete(`/shipments/${shipmentId}/photos/${photoId}`);
  },
};
