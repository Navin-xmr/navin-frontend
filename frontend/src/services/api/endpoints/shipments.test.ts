import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shipmentApi } from './shipments';
import type { Shipment } from './shipments';

vi.mock('../client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from '../client';

const mockApiClient = apiClient as unknown as { post: ReturnType<typeof vi.fn> };

const mockShipment: Shipment = {
  _id: 'ship-001',
  trackingNumber: 'NAV-001',
  origin: 'New York, NY',
  destination: 'Los Angeles, CA',
  enterpriseId: 'ent-1',
  logisticsId: 'log-1',
  status: 'DELIVERED',
  milestones: [],
  createdAt: '2024-03-15T10:30:00.000Z',
  updatedAt: '2024-03-15T10:30:00.000Z',
};

describe('shipmentApi.uploadProof', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('appends recipientSignatureName (not notes) to the FormData payload', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { data: mockShipment } });
    const file = new File(['proof-image'], 'proof.png', { type: 'image/png' });

    await shipmentApi.uploadProof('ship-001', file, 'Jane Doe');

    expect(mockApiClient.post).toHaveBeenCalledOnce();
    const [url, form, config] = mockApiClient.post.mock.calls[0];
    expect(url).toBe('/shipments/ship-001/proof');
    expect(form).toBeInstanceOf(FormData);
    expect((form as FormData).get('recipientSignatureName')).toBe('Jane Doe');
    expect((form as FormData).get('file')).toBe(file);
    expect((form as FormData).get('notes')).toBeNull();
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });

  it('returns the updated shipment on success', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { data: mockShipment } });
    const file = new File(['proof-image'], 'proof.png', { type: 'image/png' });

    const result = await shipmentApi.uploadProof('ship-001', file, 'Jane Doe');

    expect(result).toEqual(mockShipment);
  });

  it('propagates errors from the API client', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'));
    const file = new File(['proof-image'], 'proof.png', { type: 'image/png' });

    await expect(shipmentApi.uploadProof('ship-001', file, 'Jane Doe')).rejects.toThrow(
      'Validation failed'
    );
  });
});
