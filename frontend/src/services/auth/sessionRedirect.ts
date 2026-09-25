/**
 * Sends the browser to the login page with a full navigation, which also drops
 * any in-memory state belonging to the previous session. No-op when already
 * there, so repeated sign-out signals can't cause a reload loop.
 */
export function redirectToLogin(): void {
  if (window.location.pathname.startsWith("/login")) return;
  window.location.assign("/login");
}
