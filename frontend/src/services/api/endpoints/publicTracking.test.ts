import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios using vi.hoisted so the factory can reference the mock fn
const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    create: () => ({ get: mockGet }),
    isAxiosError: vi.fn(),
  },
}));

// Import after mock is set up
import { publicTrackingApi } from './publicTracking';

describe('publicTrackingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the correct endpoint with a plain tracking number', async () => {
    const mockShipment = {
      trackingNumber: 'TRACK-001',
      status: 'IN_TRANSIT',
      originCity: 'Singapore',
      destinationCity: 'Tokyo',
      expectedDelivery: '2024-02-01',
      milestones: [],
    };
    mockGet.mockResolvedValue({ data: { data: mockShipment } });

    const result = await publicTrackingApi.getByTrackingNumber('TRACK-001');

    expect(mockGet).toHaveBeenCalledWith('/api/public/shipments/TRACK-001');
    expect(result).toEqual(mockShipment);
  });

  it('encodes special characters in the tracking number', async () => {
    const mockShipment = {
      trackingNumber: 'T/1',
      status: 'CREATED',
      originCity: '',
      destinationCity: '',
      expectedDelivery: '',
      milestones: [],
    };
    mockGet.mockResolvedValue({ data: { data: mockShipment } });

    await publicTrackingApi.getByTrackingNumber('T/1');

    expect(mockGet).toHaveBeenCalledWith('/api/public/shipments/T%2F1');
  });

  it('propagates errors from the API', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    await expect(publicTrackingApi.getByTrackingNumber('TRACK-001')).rejects.toThrow('Network error');
  });
});
