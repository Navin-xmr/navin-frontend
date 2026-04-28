import { apiClient } from "../client";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await apiClient.post<AuthResponse>("/auth/login", data);
        return res.data;
    },

    register: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await apiClient.post<AuthResponse>("/auth/register", data);
        return res.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post("/auth/logout");
        localStorage.removeItem("access_token");
    },
};
