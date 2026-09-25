import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { setupErrorInterceptor } from "./errorInterceptor";
import { notifyToast } from "../../../context/toastBridge";

vi.mock("../../../context/toastBridge", () => ({
    notifyToast: vi.fn(),
}));

describe("Error Interceptor Unit Tests", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockAxiosInstance: any;
    let mockNavigate: ReturnType<typeof vi.fn>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let responseErrorInterceptorCallback: (error: any) => Promise<any>;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        localStorage.clear();

        mockNavigate = vi.fn();
        mockAxiosInstance = {
            interceptors: {
                response: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    use: vi.fn((_successCb: any, errorCb: any) => {
                        responseErrorInterceptorCallback = errorCb;
                    }),
                },
            },
        };

        setupErrorInterceptor(mockAxiosInstance, mockNavigate as (path: string) => void);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should handle 401 error, trigger toast, and navigate to login after timeout", async () => {
        const mockError = { response: { status: 401 }, message: "Unauthorized" };
        const promise = responseErrorInterceptorCallback(mockError);

        expect(notifyToast).toHaveBeenCalledWith("Session expired, redirecting to login...", "error");
        vi.advanceTimersByTime(2000);

        expect(mockNavigate).toHaveBeenCalledWith("/login");
        await expect(promise).rejects.toEqual(mockError);
    });

    it("should trigger Insufficient permissions toast on 403 status code", async () => {
        const mockError = { response: { status: 403 }, message: "Forbidden" };
        const promise = responseErrorInterceptorCallback(mockError);

        expect(notifyToast).toHaveBeenCalledWith("Insufficient permissions", "error");
        expect(mockNavigate).not.toHaveBeenCalled();
        await expect(promise).rejects.toEqual(mockError);
    });

    it("should trigger Server error toast on 500 status code", async () => {
        const mockError = { response: { status: 500 }, message: "Internal Server Error" };
        const promise = responseErrorInterceptorCallback(mockError);

        expect(notifyToast).toHaveBeenCalledWith("Server error — please try again later", "error");
        await expect(promise).rejects.toEqual(mockError);
    });
});

describe("apiClient 401 redirect (#814)", () => {
    const unauthorizedAdapter: AxiosAdapter = (config: InternalAxiosRequestConfig) =>
        Promise.reject(
            new AxiosError("Unauthorized", AxiosError.ERR_BAD_REQUEST, config, null, {
                status: 401,
                statusText: "Unauthorized",
                data: {},
                headers: {},
                config,
            }),
        );

    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("VITE_API_BASE_URL", "http://api.test");
        vi.useFakeTimers();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    const loadClient = async () => {
        const { apiClient } = await import("../client");
        const { registerNavigationBridge } = await import("../../../utils/navigationBridge");
        const navigate = vi.fn();
        registerNavigationBridge(navigate);
        return { apiClient, navigate };
    };

    it("redirects to /login through the navigation bridge", async () => {
        const { apiClient, navigate } = await loadClient();

        await expect(apiClient.get("/ledger/blocks", { adapter: unauthorizedAdapter })).rejects.toMatchObject({
            response: { status: 401 },
        });
        expect(navigate).not.toHaveBeenCalled();

        vi.advanceTimersByTime(2000);

        expect(navigate).toHaveBeenCalledOnce();
        expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
    });

    it("clears the stored token on a 401", async () => {
        localStorage.setItem("authToken", "header.payload.signature");
        const { apiClient } = await loadClient();

        await expect(apiClient.get("/shipments", { adapter: unauthorizedAdapter })).rejects.toBeDefined();

        expect(localStorage.getItem("authToken")).toBeNull();
    });

    it("navigates only once when parallel requests all fail with 401", async () => {
        const { apiClient, navigate } = await loadClient();

        await Promise.allSettled([
            apiClient.get("/shipments", { adapter: unauthorizedAdapter }),
            apiClient.get("/ledger/blocks", { adapter: unauthorizedAdapter }),
            apiClient.get("/notifications", { adapter: unauthorizedAdapter }),
        ]);

        vi.advanceTimersByTime(2000);

        expect(navigate).toHaveBeenCalledOnce();
    });
});
