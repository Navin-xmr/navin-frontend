import { apiClient } from "../client";

export type UserRole = "Admin" | "Manager" | "Viewer";
export type UserStatus = "Active" | "Inactive";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
}

export interface InviteUserRequest {
    email: string;
    role: UserRole;
}

export interface UpdateRoleRequest {
    role: UserRole;
}

export const usersApi = {
    getAll: async (): Promise<User[]> => {
        const res = await apiClient.get<{ data: User[] }>("/users");
        return res.data.data;
    },

    invite: async (data: InviteUserRequest): Promise<User> => {
        const res = await apiClient.post<{ data: User }>("/users/invite", data);
        return res.data.data;
    },

    updateRole: async (id: string, data: UpdateRoleRequest): Promise<User> => {
        const res = await apiClient.patch<{ data: User }>(`/users/${id}/role`, data);
        return res.data.data;
    },

    deactivate: async (id: string): Promise<User> => {
        const res = await apiClient.patch<{ data: User }>(`/users/${id}/deactivate`);
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};
