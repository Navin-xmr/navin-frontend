import { setupErrorInterceptor } from "./errorInterceptor";
import { toast } from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
    toast: {
        error: jest.fn(),
    },
}));

describe("Error Interceptor Unit Tests", () => {
    let mockAxiosInstance: any;
    let mockNavigate: jest.Mock;
    let responseErrorInterceptorCallback: Function;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        localStorage.clear();

        mockNavigate = jest.fn();
        mockAxiosInstance = {
            interceptors: {
                response: {
                    use: jest.fn((successCb, errorCb) => {
                        responseErrorInterceptorCallback = errorCb;
                    }),
                },
            },
        };

        setupErrorInterceptor(mockAxiosInstance, mockNavigate);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should handle 401 error, trigger toast, and navigate to login after timeout", async () => {
        const mockError = { response: { status: 401 }, message: "Unauthorized" };
        const promise = responseErrorInterceptorCallback(mockError);

        expect(toast.error).toHaveBeenCalledWith("Session expired, redirecting to login...");
        jest.advanceTimersByTime(2000);

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
