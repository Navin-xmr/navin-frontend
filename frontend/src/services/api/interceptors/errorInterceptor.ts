import { AxiosInstance, AxiosError } from "axios";
import { toast } from "react-hot-toast";

// This stops the app from showing multiple pop-ups at the same time if multiple requests fail at once
let isRedirecting = false;

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

const getResponseMessage = (error: AxiosError): string | undefined => {
    const data = error.response?.data;
    if (!data || typeof data !== "object") return undefined;
    const body = data as ApiErrorResponse;
    return body.message ?? body.error;
};

const getDescriptiveErrorMessage = (error: AxiosError): string => {
    const status = error.response?.status;
    const responseMessage = getResponseMessage(error);

    if (responseMessage) return responseMessage;
    if (!error.response) {
        return "Network request failed. Check your connection and try again.";
    }

    switch (status) {
        case 400:
            return "The request could not be processed. Review the entered information and try again.";
        case 403:
            return "Insufficient permissions";
        case 404:
            return "The requested record could not be found. It may have been moved or deleted.";
        case 409:
            return "This record changed while you were working. Refresh and try again.";
        case 422:
            return "Some information is invalid. Review highlighted fields and try again.";
        case 429:
            return "Too many requests. Wait a moment and try again.";
        case 500:
            return "Server error — please try again later";
        default:
            return "Request failed. Try again or contact support if the issue continues.";
    }
};

export const setupErrorInterceptor = (client: AxiosInstance, navigateFn?: (path: string) => void) => {
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            const status = error.response?.status;
            const message = getDescriptiveErrorMessage(error);

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
                    toast.error(message);
                    break;

                case 500:
                    // Show server error toast
                    toast.error(message);
                    break;

                default:
                    toast.error(message);
                    console.error("API Error:", message);
            }

            return Promise.reject(error);
        },
    );
};
