import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shipmentPhotosApi } from './shipmentPhotos';
import type { ShipmentPhoto } from '../../../types/shipmentPhoto';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '../client';

const mockApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

// === Fixtures

const mockPhoto: ShipmentPhoto = {
  id: 'photo-001',
  url: 'https://cdn.navin.io/photos/photo-001.jpg',
  type: 'PICKUP',
  uploadedAt: '2026-07-10T09:00:00.000Z',
  uploaderName: 'Jane Doe',
};

const mockSecondPhoto: ShipmentPhoto = {
  id: 'photo-002',
  url: 'https://cdn.navin.io/photos/photo-002.jpg',
  type: 'DAMAGE',
  uploadedAt: '2026-07-11T09:00:00.000Z',
  uploaderName: 'John Smith',
};

describe('shipmentPhotosApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('requests the shipment photos and unwraps the envelope', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: [mockPhoto, mockSecondPhoto] } });

      const result = await shipmentPhotosApi.getAll('shipment-100');

      expect(mockApiClient.get).toHaveBeenCalledWith('/shipments/shipment-100/photos');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('photo-001');
    });

    it('returns an empty array when the shipment has no photos', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: [] } });

      const result = await shipmentPhotosApi.getAll('shipment-999');

      expect(result).toEqual([]);
    });

    it('propagates a rejected request', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Request failed'));

      await expect(shipmentPhotosApi.getAll('shipment-100')).rejects.toThrow('Request failed');
    });
  });

  describe('upload', () => {
    it('posts multipart form data containing the file and type', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { data: mockPhoto } });

      const file = new File(['photo-bytes'], 'pickup.jpg', { type: 'image/jpeg' });
      const result = await shipmentPhotosApi.upload('shipment-100', file, 'PICKUP');

      expect(mockApiClient.post).toHaveBeenCalledTimes(1);

      const [url, body, config] = mockApiClient.post.mock.calls[0];
      expect(url).toBe('/shipments/shipment-100/photos');
      expect(body).toBeInstanceOf(FormData);
      expect((body as FormData).get('file')).toBe(file);
      expect((body as FormData).get('type')).toBe('PICKUP');
      expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
      expect(result).toEqual(mockPhoto);
    });

    it('forwards the requested photo type', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { data: mockSecondPhoto } });

      const file = new File(['photo-bytes'], 'damage.jpg', { type: 'image/jpeg' });
      const result = await shipmentPhotosApi.upload('shipment-101', file, 'DAMAGE');

      const [, body] = mockApiClient.post.mock.calls[0];
      expect((body as FormData).get('type')).toBe('DAMAGE');
      expect(result.type).toBe('DAMAGE');
    });

    it('propagates a rejected upload', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('File too large'));

      const file = new File(['photo-bytes'], 'pickup.jpg', { type: 'image/jpeg' });

      await expect(shipmentPhotosApi.upload('shipment-100', file, 'PICKUP')).rejects.toThrow(
        'File too large'
      );
    });
  });

  describe('delete', () => {
    it('deletes the photo by shipment and photo id', async () => {
      mockApiClient.delete.mockResolvedValueOnce({ data: {} });

      await expect(
        shipmentPhotosApi.delete('shipment-100', 'photo-001')
      ).resolves.toBeUndefined();

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/shipments/shipment-100/photos/photo-001'
      );
    });

    it('propagates a rejected request', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Not authorised'));

      await expect(shipmentPhotosApi.delete('shipment-100', 'photo-001')).rejects.toThrow(
        'Not authorised'
      );
    });
  });
});
