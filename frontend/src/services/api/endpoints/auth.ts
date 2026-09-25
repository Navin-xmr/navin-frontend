import * as Sentry from "@sentry/react";
import { apiClient } from "../client";
import { setToken, clearToken } from "../../auth/tokenStorage";

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    organizationId?: string;
}

export interface CompanyRegisterRequest {
    companyName: string;
    industry: string;
    country: string;
    companySize: string;
    adminName: string;
    email: string;
    password: string;
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

/**
 * Identifies the authenticated user in Sentry without sending PII.
 * Only the opaque user ID is sent; the role is attached as a searchable tag.
 */
const setSentryUser = (user: AuthUser): void => {
    Sentry.setUser({ id: user.id });
    Sentry.setTag('role', user.role);
};

/** Drops the client-side session: the stored token and the Sentry user. */
export const clearLocalSession = (): void => {
    clearToken();
    Sentry.setUser(null);
};

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await apiClient.post<{ data: AuthResponse }>("/auth/login", data);
        const { token, user } = res.data.data;
        setToken(token);
        setSentryUser(user);
        return res.data.data;
    },

    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        const res = await apiClient.post<{ data: AuthResponse }>("/auth/signup", data);
        const { token, user } = res.data.data;
        setToken(token);
        setSentryUser(user);
        return res.data.data;
    },

    registerCompany: async (data: CompanyRegisterRequest): Promise<void> => {
        await apiClient.post("/auth/register/company", data);
    },

    logout: async (): Promise<void> => {
        try {
            await apiClient.post("/auth/logout");
        } finally {
            // A failed or timed-out request must not leave the user signed in
            // locally, so client-side cleanup always runs.
            clearLocalSession();
        }
    },

    refresh: async (): Promise<void> => {
        const res = await apiClient.post<{ data: { token: string } }>("/auth/refresh");
        setToken(res.data.data.token);
    },

    forgotPassword: async (data: { email: string }): Promise<void> => {
        await apiClient.post('/auth/forgot-password', data);
    },

    resetPassword: async (data: { token: string; newPassword: string }): Promise<void> => {
        await apiClient.post('/auth/reset-password', data);
    },

    verifyEmail: async (data: { token: string }): Promise<void> => {
        await apiClient.post('/auth/verify-email', data);
    },

    resendVerification: async (data: { email: string }): Promise<void> => {
        await apiClient.post('/auth/resend-verification', data);
    },
};
