import { AxiosInstance, AxiosError } from "axios";
import { toast } from "react-hot-toast";

// This stops the app from showing multiple pop-ups at the same time if multiple requests fail at once
let isRedirecting = false;

export const setupErrorInterceptor = (client: AxiosInstance, navigateFn?: (path: string) => void) => {
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            const status = error.response?.status;

            // Requests that never got a response (offline, DNS/connection failure,
            // or our own client-side timeout) don't have a status code. Surface
            // those distinctly instead of silently failing with only a console log.
            // The shared toast `id` collapses repeat failures (e.g. several
            // in-flight requests dropping at once) into a single toast instead of
            // stacking one per request.
            if (!error.response) {
                const message =
                    error.code === "ECONNABORTED"
                        ? "Request timed out. Check your connection and try again."
                        : typeof navigator !== "undefined" && !navigator.onLine
                            ? "You're offline. This action didn't go through."
                            : "Network error — please check your connection and try again.";
                toast.error(message, { id: "network-error" });
                return Promise.reject(error);
            }

            switch (status) {
                case 401:
                    if (!isRedirecting) {
                        isRedirecting = true;
                        
                        // Clean up old login token safely
                        localStorage.removeItem("authToken");
                        
                        // Show the exact toast message requested by the issue
                        toast.error("Session expired, redirecting to login...");
                        
                        // Wait 2 seconds so the user can read it, then change pages cleanly
                        setTimeout(() => {
                            navigateFn?.("/login");
                            isRedirecting = false;
                        }, 2000);
                    }
                    break;

                case 403:
                    // Show insufficient permissions toast
                    toast.error("Insufficient permissions");
                    break;

                case 500:
                    // Show server error toast
                    toast.error("Server error — please try again later");
                    break;

                default:
                    console.error("API Error:", error.message);
            }

            return Promise.reject(error);
        },
    );
};
