import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setupErrorInterceptor } from "./errorInterceptor";
import { toast } from "react-hot-toast";

vi.mock("react-hot-toast", () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe("Error Interceptor Unit Tests", () => {
    let mockAxiosInstance: any;
    let mockNavigate: ReturnType<typeof vi.fn>;
    let responseErrorInterceptorCallback: (error: any) => Promise<any>;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        localStorage.clear();

        mockNavigate = vi.fn();
        mockAxiosInstance = {
            interceptors: {
                response: {
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

        expect(toast.error).toHaveBeenCalledWith("Session expired, redirecting to login...");
        vi.advanceTimersByTime(2000);

        expect(mockNavigate).toHaveBeenCalledWith("/login");
        await expect(promise).rejects.toEqual(mockError);
    });

    it("should trigger Insufficient permissions toast on 403 status code", async () => {
        const mockError = { response: { status: 403 }, message: "Forbidden" };
        const promise = responseErrorInterceptorCallback(mockError);

        expect(toast.error).toHaveBeenCalledWith("Insufficient permissions");
        expect(mockNavigate).not.toHaveBeenCalled();
        await expect(promise).rejects.toEqual(mockError);
    });

    it("should trigger Server error toast on 500 status code", async () => {
        const mockError = { response: { status: 500 }, message: "Internal Server Error" };
        const promise = responseErrorInterceptorCallback(mockError);

        expect(toast.error).toHaveBeenCalledWith("Server error — please try again later");
        await expect(promise).rejects.toEqual(mockError);
    });
});
