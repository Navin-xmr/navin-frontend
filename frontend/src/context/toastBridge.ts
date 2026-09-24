/**
 * Toast bridge — lets non-React modules (e.g. the axios error interceptor)
 * surface toasts through the ToastContext system without being a component.
 * ToastProvider registers itself on mount via registerToastBridge.
 */

export type BridgeToastType = "success" | "error" | "info" | "warning";

type AddToastFn = (message: string, type: BridgeToastType, key?: string) => void;

let currentAddToast: AddToastFn | undefined;

export const registerToastBridge = (fn: AddToastFn | undefined): void => {
    currentAddToast = fn;
};

export const notifyToast = (message: string, type: BridgeToastType, key?: string): void => {
    currentAddToast?.(message, type, key);
};