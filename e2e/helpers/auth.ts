import type { Page } from "@playwright/test";

/** A structurally valid JWT that passes the `isValidJWT` check in authInterceptor.ts */
export const COMPANY_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MDg0MDAwMH0.fake_signature_for_e2e_testing_only";

export const CUSTOMER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMiIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1MDg0MDAwMH0.fake_customer_signature_for_e2e";

/**
 * Sets the authToken in localStorage so the app treats the user as authenticated.
 * Call this before navigating to any protected route to skip the login UI.
 *
 * Must be called after page.goto() or inside a storageState fixture, because
 * localStorage is scoped to an origin and requires a page context.
 */
export async function loginAs(
  page: Page,
  token = COMPANY_TOKEN,
): Promise<void> {
  await page.evaluate((t) => {
    localStorage.setItem("authToken", t);
  }, token);
}

/**
 * Navigate to a protected route with the auth token already in localStorage.
 * Combines goto + loginAs + a second goto so the app sees the token on load.
 */
export async function gotoProtected(
  page: Page,
  path: string,
  token = COMPANY_TOKEN,
): Promise<void> {
  // Prime the origin so we can write to localStorage
  await page.goto("/login");
  await loginAs(page, token);
  await page.goto(path);
}

/** Clears auth state from localStorage */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem("authToken");
  });
}
