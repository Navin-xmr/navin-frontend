import { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 * Validates that a string looks like a JWT (3 dot-separated base64 segments).
 * This is a structural check only — it does NOT verify the signature.
 */
const isValidJWT = (token: string): boolean => {
    if (!token || token.trim().length === 0) {
        return false;
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
        return false;
    }
    // Each part should be non-empty and contain only valid base64url chars
    const base64urlPattern = /^[A-Za-z0-9_-]+$/;
    return parts.every((part) => base64urlPattern.test(part) && part.length > 0);
};

export const setupAuthInterceptor = (client: AxiosInstance) => {
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem("authToken");

            if (token && config.headers) {
                if (isValidJWT(token)) {
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    // Token is malformed or corrupted — clear it to prevent 401 loops
                    localStorage.removeItem("authToken");
                    // Only redirect if not already on login page to avoid infinite loops
                    if (!window.location.pathname.includes("/login")) {
                        window.location.href = "/login";
                    }
                }
            }

            return config;
        },
        (error) => Promise.reject(error),
    );
};