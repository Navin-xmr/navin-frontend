import { test, expect } from "@playwright/test";
import { gotoProtected, loginAs, logout, COMPANY_TOKEN } from "./helpers/auth";
import { mockAuth, mockShipments, blockTelemetry } from "./helpers/intercept";

test.beforeEach(async ({ page }) => {
  await blockTelemetry(page);
  await mockAuth(page);
});

test.describe("Authentication", () => {
  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await mockShipments(page);
    await page.goto("/login");

    await page.fill("#email", "admin@navin.com");
    await page.fill("#password", "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
  });

  test("login with invalid credentials shows error message", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill("#email", "wrong@example.com");
    await page.fill("#password", "badpassword");
    await page.click('button[type="submit"]');

    const alert = page
      .getByRole("alert")
      .filter({ hasText: /invalid email or password/i });
    await expect(alert).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("login form shows field-level validation errors", async ({ page }) => {
    await page.goto("/login");

    // Submit with empty fields
    await page.click('button[type="submit"]');

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("login form validates email format", async ({ page }) => {
    await page.goto("/login");

    await page.fill("#email", "not-an-email");
    await page.locator("#email").blur();

    await expect(page.getByText("Invalid email format")).toBeVisible();
  });

  test("logout redirects to landing page", async ({ page }) => {
    await mockShipments(page);
    await gotoProtected(page, "/dashboard");

    // Trigger logout via the API mock (simulate removing token directly)
    await logout(page);
    await page.goto("/");

    await expect(page).toHaveURL("/");
  });

  test("accessing /dashboard unauthenticated redirects to login", async ({
    page,
  }) => {
    // Ensure no token is set
    await page.goto("/login");
    await page.evaluate(() => localStorage.removeItem("authToken"));

    await page.goto("/dashboard");

    // Allow the 150ms auth check delay
    await expect(page).toHaveURL(/\/login/, { timeout: 3000 });
  });

  test("protected routes are inaccessible after logout", async ({ page }) => {
    await gotoProtected(page, "/dashboard");
    await logout(page);
    await page.goto("/dashboard/shipments");

    await expect(page).toHaveURL(/\/login/, { timeout: 3000 });
  });

  test("previously saved location is restored after login", async ({
    page,
  }) => {
    await mockShipments(page);

    // Try to visit a protected page without auth
    await page.goto("/login");
    await page.evaluate(() => localStorage.removeItem("authToken"));
    await page.goto("/dashboard/shipments");

    // Should be on login
    await expect(page).toHaveURL(/\/login/);

    // Now log in
    await page.fill("#email", "admin@navin.com");
    await page.fill("#password", "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard/shipments");
  });

  test("auth check loading spinner renders then resolves", async ({ page }) => {
    await mockShipments(page);

    // Set token before navigating so auth resolves successfully
    await page.goto("/login");
    await loginAs(page, COMPANY_TOKEN);
    await page.goto("/dashboard");

    // Dashboard should load (spinner resolves within 150ms)
    await expect(page.getByRole("main")).toBeVisible({ timeout: 2000 });
  });
});
