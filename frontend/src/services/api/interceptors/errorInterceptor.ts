import { AxiosInstance, AxiosError } from "axios";

export const setupErrorInterceptor = (client: AxiosInstance) => {
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            const status = error.response?.status;

            switch (status) {
                case 401:
                    console.error("Unauthorized - logging out");
                    localStorage.removeItem("access_token");
                    window.location.href = "/login";
                    break;

                case 403:
                    console.error("Forbidden - insufficient permissions");
                    break;

                case 500:
                    console.error("Server error - try again later");
                    break;

                default:
                    console.error("API Error:", error.message);
            }

            return Promise.reject(error);
        },
    );
};
