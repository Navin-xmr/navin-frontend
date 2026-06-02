import { apiClient } from "../client";

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    organizationId?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await apiClient.post<{ data: AuthResponse }>("/auth/login", data);
        const { token } = res.data.data;
        localStorage.setItem("authToken", token);
        return res.data.data;
    },

    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        const res = await apiClient.post<{ data: AuthResponse }>("/auth/signup", data);
        const { token } = res.data.data;
        localStorage.setItem("authToken", token);
        return res.data.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post("/auth/logout");
        localStorage.removeItem("authToken");
    },
};
