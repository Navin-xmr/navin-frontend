import * as Sentry from "@sentry/react";
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
        const { token, user } = res.data.data;
        localStorage.setItem("authToken", token);
        Sentry.setUser({ id: user.id, email: user.email, username: user.role });
        return res.data.data;
    },

    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        const res = await apiClient.post<{ data: AuthResponse }>("/auth/signup", data);
        const { token, user } = res.data.data;
        localStorage.setItem("authToken", token);
        Sentry.setUser({ id: user.id, email: user.email, username: user.role });
        return res.data.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post("/auth/logout");
        localStorage.removeItem("authToken");
        Sentry.setUser(null);
    },

    refresh: async (): Promise<void> => {
        const res = await apiClient.post<{ data: { token: string } }>("/auth/refresh");
        localStorage.setItem("authToken", res.data.data.token);
    },
    forgotPassword: async (data: { email: string }): Promise<void> => {
        await apiClient.post('/auth/forgot-password', data);
    },

    resetPassword: async (data: { token: string; newPassword: string }): Promise<void> => {
        await apiClient.post('/auth/reset-password', data);
    },};
