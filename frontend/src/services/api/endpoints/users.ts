import { apiClient } from "../client";

export type UserRole = "Admin" | "Manager" | "Viewer" | "Driver";
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
  message?: string;
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

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Invitation {
  _id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  message?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  name: string;
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

export const invitationsApi = {
  list: async (): Promise<Invitation[]> => {
    const res = await apiClient.get<{ data: Invitation[] }>("/company/invitations");
    return res.data.data;
  },

  send: async (data: InviteUserRequest): Promise<Invitation> => {
    const res = await apiClient.post<{ data: Invitation }>("/company/invitations", data);
    return res.data.data;
  },

  resend: async (id: string): Promise<Invitation> => {
    const res = await apiClient.post<{ data: Invitation }>(`/company/invitations/${id}/resend`);
    return res.data.data;
  },

  revoke: async (id: string): Promise<void> => {
    await apiClient.delete(`/company/invitations/${id}`);
  },

  accept: async (data: AcceptInvitationRequest): Promise<{ token: string }> => {
    const res = await apiClient.post<{ data: { token: string } }>("/company/invitations/accept", data);
    return res.data.data;
  },

  getInfo: async (token: string): Promise<{ companyName: string; role: UserRole; email: string }> => {
    const res = await apiClient.get<{ data: { companyName: string; role: UserRole; email: string } }>(
      `/company/invitations/info?token=${encodeURIComponent(token)}`
    );
    return res.data.data;
  },
};
