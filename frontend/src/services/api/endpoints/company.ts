import { apiClient } from '../client';

export interface CompanyProfile {
  name: string;
  address: string;
  logoUrl?: string;
}

export const companyApi = {
  getProfile: async (): Promise<CompanyProfile> => {
    const res = await apiClient.get<{ data: CompanyProfile }>('/company/profile');
    return res.data.data;
  },

  updateProfile: async (data: Partial<Omit<CompanyProfile, 'logoUrl'>>): Promise<CompanyProfile> => {
    const res = await apiClient.patch<{ data: CompanyProfile }>('/company/profile', data);
    return res.data.data;
  },

  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await apiClient.post<{ data: { logoUrl: string } }>('/company/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};
