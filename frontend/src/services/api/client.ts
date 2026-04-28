import axios from "axios";
import { setupAuthInterceptor } from "./interceptors/authInterceptor";
import { setupErrorInterceptor } from "./interceptors/errorInterceptor";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
    throw new Error("VITE_API_BASE_URL is not defined");
}

export const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

setupAuthInterceptor(apiClient);
setupErrorInterceptor(apiClient);
