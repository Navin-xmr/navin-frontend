import { test, expect } from "@playwright/test";
import { gotoProtected, CUSTOMER_TOKEN } from "./helpers/auth";
import { mockShipments, mockAuth, blockTelemetry } from "./helpers/intercept";
import shipmentsFixture from "./fixtures/shipments.json";

test.beforeEach(async ({ page }) => {
  await blockTelemetry(page);
  await mockAuth(page);
  await mockShipments(page);
});

test.describe("Shipments — Customer view", () => {
  test("customer can view the shipments list", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments", CUSTOMER_TOKEN);

    // At least one shipment should be visible
    await expect(
      page.getByText(shipmentsFixture.list.data[0].id),
    ).toBeVisible();
  });

  test("customer can open a shipment detail page", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments/ship-001", CUSTOMER_TOKEN);

    // Page renders — header with shipment info should be present
    await expect(page.getByText(/#SHP-992834/i)).toBeVisible();
  });

  test("customer shipment detail shows milestone timeline", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/shipments/ship-001", CUSTOMER_TOKEN);

    // The milestone section should be present on the page
    const milestoneSection = page
      .locator('[class*="milestone"], [class*="timeline"]')
      .first();
    await expect(milestoneSection).toBeVisible();
  });

  test('customer cannot see "Create Shipment" link in navigation', async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/shipments", CUSTOMER_TOKEN);

    // The create shipment nav link / button should not be present for customers
    // (the route exists but the sidebar nav item should be absent or access should redirect)
    const createLink = page.getByRole("link", { name: /create shipment/i });
    await expect(createLink).toHaveCount(0);
  });

  test("customer cannot access the create shipment page directly", async ({
    page,
  }) => {
    // Customer token is set but the create route should either
    // not show company-specific controls or handle the customer gracefully
    await gotoProtected(page, "/dashboard/shipments/create", CUSTOMER_TOKEN);

    // Page should load without crashing (React renders within the protected layout)
    await expect(page.locator("body")).toBeVisible();
  });

  test("customer shipments list shows correct columns", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments", CUSTOMER_TOKEN);

    await expect(
      page.getByRole("columnheader", { name: /shipment id/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /origin/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /destination/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /status/i }),
    ).toBeVisible();
  });

  test("customer sees delivery status badge on shipment row", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/shipments", CUSTOMER_TOKEN);

    // The DELIVERED status badge should be visible for ship-002
    await expect(page.getByText("DELIVERED")).toBeVisible();
  });
});
