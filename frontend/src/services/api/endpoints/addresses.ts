import { apiClient } from "../client";

export interface Address {
  _id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressRequest {
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  label?: string;
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export const addressesApi = {
  getAll: async (): Promise<Address[]> => {
    const res = await apiClient.get<{ data: Address[] }>("/addresses");
    return res.data.data;
  },

  getById: async (id: string): Promise<Address> => {
    const res = await apiClient.get<{ data: Address }>(`/addresses/${id}`);
    return res.data.data;
  },

  create: async (data: CreateAddressRequest): Promise<Address> => {
    const res = await apiClient.post<{ data: Address }>("/addresses", data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateAddressRequest): Promise<Address> => {
    const res = await apiClient.patch<{ data: Address }>(`/addresses/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },

  setDefault: async (id: string): Promise<Address> => {
    const res = await apiClient.patch<{ data: Address }>(`/addresses/${id}/default`);
    return res.data.data;
  },
};
