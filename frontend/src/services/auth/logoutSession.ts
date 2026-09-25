import { authApi, clearLocalSession } from "../api/endpoints/auth";
import { realtimeService } from "../realtime/realtimeService";

export interface LogoutSessionOptions {
  /**
   * Whether to ask the backend to invalidate the session. Skip it when the
   * token has already expired: the request can't authenticate, and its 401
   * would trigger the global "session expired" redirect a second time.
   */
  notifyServer?: boolean;
}

/**
 * The single sign-out routine shared by every logout path. It tries to
 * invalidate the server session (ignoring failures), then always clears the
 * stored token and Sentry user and closes the real-time connection.
 */
export async function logoutSession({ notifyServer = true }: LogoutSessionOptions = {}): Promise<void> {
  try {
    if (notifyServer) {
      await authApi.logout();
    } else {
      clearLocalSession();
    }
  } catch {
    // Server-side invalidation is best-effort; authApi.logout has already
    // cleared the local session in its finally block.
  } finally {
    realtimeService.disconnect();
  }
}
