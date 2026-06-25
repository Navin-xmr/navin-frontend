import { apiClient } from "../client";

export type UserRole = "Admin" | "Manager" | "Viewer";
export type UserStatus = "Active" | "Inactive";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
}

export interface UpdateRoleRequest {
  role: UserRole;
}

export interface PaginatedUsers {
  data: User[];
  page: number;
  limit: number;
  total: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "All";
}

export const usersApi = {
  getAll: async (params?: GetUsersParams): Promise<PaginatedUsers> => {
    const res = await apiClient.get<{ data: PaginatedUsers }>("/users", { params });
    return res.data.data;
  },

  invite: async (data: InviteUserRequest): Promise<User> => {
    const res = await apiClient.post<{ data: User }>("/users/invite", data);
    return res.data.data;
  },

  updateRole: async (id: string, role: UserRole): Promise<User> => {
    const res = await apiClient.patch<{ data: User }>(`/users/${id}/role`, { role });
    return res.data.data;
  },

  deactivate: async (id: string): Promise<User> => {
    const res = await apiClient.patch<{ data: User }>(`/users/${id}/deactivate`);
    return res.data.data;
  },

  activate: async (id: string): Promise<User> => {
    const res = await apiClient.patch<{ data: User }>(`/users/${id}/activate`);
    return res.data.data;
  },
};
