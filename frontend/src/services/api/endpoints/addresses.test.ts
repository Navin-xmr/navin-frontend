import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addressesApi } from './addresses';
import type { Address } from './addresses';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '../client';

const mockApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockAddress: Address = {
  _id: 'addr-1',
  label: 'Home',
  name: 'Jane Doe',
  phone: '+1234567890',
  street: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  country: 'US',
  postalCode: '62704',
  isDefault: true,
};

describe('addressesApi endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getAll returns the unwrapped address list', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: { data: [mockAddress] } });

    const result = await addressesApi.getAll();

    expect(mockApiClient.get).toHaveBeenCalledWith('/addresses');
    expect(result).toEqual([mockAddress]);
  });

  it('getAll propagates rejection from the client', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('network error'));

    await expect(addressesApi.getAll()).rejects.toThrow('network error');
  });

  it('getById requests the address by id', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: { data: mockAddress } });

    const result = await addressesApi.getById('addr-1');

    expect(mockApiClient.get).toHaveBeenCalledWith('/addresses/addr-1');
    expect(result).toEqual(mockAddress);
  });

  it('create posts the new address payload', async () => {
    const payload = {
      label: 'Home',
      name: 'Jane Doe',
      phone: '+1234567890',
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      country: 'US',
      postalCode: '62704',
    };
    mockApiClient.post.mockResolvedValueOnce({ data: { data: mockAddress } });

    const result = await addressesApi.create(payload);

    expect(mockApiClient.post).toHaveBeenCalledWith('/addresses', payload);
    expect(result).toEqual(mockAddress);
  });

  it('update patches the address by id', async () => {
    mockApiClient.patch.mockResolvedValueOnce({ data: { data: { ...mockAddress, city: 'Chicago' } } });

    const result = await addressesApi.update('addr-1', { city: 'Chicago' });

    expect(mockApiClient.patch).toHaveBeenCalledWith('/addresses/addr-1', { city: 'Chicago' });
    expect(result.city).toBe('Chicago');
  });

  it('delete calls the client with the address id and returns nothing', async () => {
    mockApiClient.delete.mockResolvedValueOnce(undefined);

    const result = await addressesApi.delete('addr-1');

    expect(mockApiClient.delete).toHaveBeenCalledWith('/addresses/addr-1');
    expect(result).toBeUndefined();
  });

  it('setDefault patches the default flag for the address id', async () => {
    mockApiClient.patch.mockResolvedValueOnce({ data: { data: { ...mockAddress, isDefault: true } } });

    const result = await addressesApi.setDefault('addr-1');

    expect(mockApiClient.patch).toHaveBeenCalledWith('/addresses/addr-1/default');
    expect(result.isDefault).toBe(true);
  });
});
