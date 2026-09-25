/**
 * Navigation bridge — lets non-React modules (e.g. the axios error interceptor)
 * trigger React Router navigation without being a component. App registers the
 * router's navigate function on mount via registerNavigationBridge; until then
 * (or after it unregisters) navigation falls back to a full page load.
 */

export interface BridgeNavigateOptions {
    replace?: boolean;
}

type NavigateFn = (path: string, options?: BridgeNavigateOptions) => void;

let currentNavigate: NavigateFn | undefined;

export const registerNavigationBridge = (fn: NavigateFn | undefined): void => {
    currentNavigate = fn;
};

export const navigateTo = (path: string, options: BridgeNavigateOptions = { replace: true }): void => {
    if (currentNavigate) {
        currentNavigate(path, options);
        return;
    }
    window.location.assign(path);
};
