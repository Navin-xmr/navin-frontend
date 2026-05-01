import axios from "axios";
import { setupAuthInterceptor } from "./interceptors/authInterceptor";
import { setupErrorInterceptor } from "./interceptors/errorInterceptor";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";

export const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Intercept requests to guard against missing base URL at runtime
apiClient.interceptors.request.use((config) => {
    if (!baseURL) {
        return Promise.reject(new Error("VITE_API_BASE_URL is not configured"));
    }
    return config;
});

setupAuthInterceptor(apiClient);
setupErrorInterceptor(apiClient);
