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

/**
 * #202: Recursively map _id → id so frontend code can use the canonical `id`
 * field regardless of whether MongoDB returns `_id`.
 */
const mapIdFields = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(mapIdFields);
    if (value !== null && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        if ("_id" in obj && !("id" in obj)) {
            obj.id = obj._id;
        }
        for (const key of Object.keys(obj)) {
            obj[key] = mapIdFields(obj[key]);
        }
    }
    return value;
};

apiClient.interceptors.response.use((response) => {
    response.data = mapIdFields(response.data);
    return response;
});

setupAuthInterceptor(apiClient);
setupErrorInterceptor(apiClient);
