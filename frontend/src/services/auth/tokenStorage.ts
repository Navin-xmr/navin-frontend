/**
 * Centralized auth-token storage.
 *
 * All reads and writes of the session token MUST go through this module so that
 * a future migration to an httpOnly cookie (issued by navin-backend) only
 * requires changing the implementation here — call sites remain untouched.
 *
 * Threat-model note:
 *   The current mechanism (localStorage) is susceptible to XSS exfiltration.
 *   The intended migration path is to have navin-backend set the token as an
 *   httpOnly, SameSite=Strict cookie, at which point `getToken` can return null
 *   (the browser attaches the cookie automatically) and `setToken`/`clearToken`
 *   become no-ops or hit a /auth/cookie endpoint.  Because every call site already
 *   uses this module, that migration will require changes only here.
 */

const TOKEN_KEY = "authToken";

type TokenChangeListener = () => void;

const listeners = new Set<TokenChangeListener>();

function notifyTokenChange(): void {
  listeners.forEach((listener) => listener());
}

/** Returns the stored auth token, or null if none is present. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persists an auth token. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  notifyTokenChange();
}

/** Removes the stored auth token (logout / session expiry). */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  notifyTokenChange();
}

/**
 * Subscribes to token writes made through this module (login, signup, refresh,
 * logout) so auth state can update without a page reload. Returns an
 * unsubscribe function.
 */
export function onTokenChange(listener: TokenChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
