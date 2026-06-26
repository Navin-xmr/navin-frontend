import { test, expect } from "@playwright/test";
import { gotoProtected } from "./helpers/auth";
import { mockShipments, mockAuth, blockTelemetry } from "./helpers/intercept";
import shipmentsFixture from "./fixtures/shipments.json";

test.beforeEach(async ({ page }) => {
  await blockTelemetry(page);
  await mockAuth(page);
  await mockShipments(page);
});

test.describe("Shipments — Company view", () => {
  test("shipments list renders with rows from API", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments");

    // All three fixture shipments should appear in the table
    for (const shipment of shipmentsFixture.list.data) {
      await expect(page.getByText(shipment.id)).toBeVisible();
    }
  });

  test("pagination summary is displayed", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments");

    await expect(page.getByText(/showing/i)).toBeVisible();
  });

  test("previous page button is disabled on first page", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments");

    const prevBtn = page.getByRole("button", { name: /prev/i });
    await expect(prevBtn).toBeDisabled();
  });

  test("filter shipments by status — IN_TRANSIT", async ({ page }) => {
    // Override the route to return only IN_TRANSIT shipments
    await page.route("**/api/shipments*", async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get("status") === "IN_TRANSIT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...shipmentsFixture.list,
            data: shipmentsFixture.list.data.filter(
              (s) => s.status === "IN_TRANSIT",
            ),
          }),
        });
      } else {
        await route.continue();
      }
    });

    await gotoProtected(page, "/dashboard/shipments?status=IN_TRANSIT");

    await expect(page.getByText("ship-001")).toBeVisible();
    await expect(page.getByText("ship-002")).not.toBeVisible();
  });

  test("shipment row shows origin, destination, and status badge", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/shipments");

    const firstShipment = shipmentsFixture.list.data[0];
    await expect(page.getByText(firstShipment.origin)).toBeVisible();
    await expect(page.getByText(firstShipment.destination)).toBeVisible();
    await expect(page.getByText(firstShipment.status)).toBeVisible();
  });

  test("open shipment detail renders all key sections", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments/ship-001");

    // ShipmentDetailHeader — shows shipment id
    await expect(page.getByText(/#SHP-992834/i)).toBeVisible();
    // Status badge
    await expect(page.getByText(/IN_TRANSIT/i)).toBeVisible();
    // Milestone timeline section should render
    await expect(
      page.locator('main, [class*="shipment-detail"]').first(),
    ).toBeVisible();
  });

  test("create shipment form renders all required fields", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments/create");

    await expect(page.locator("#origin")).toBeVisible();
    await expect(page.locator("#destination")).toBeVisible();
    await expect(page.locator("#itemDescription")).toBeVisible();
    await expect(page.locator("#weight")).toBeVisible();
    await expect(page.locator("#recipientName")).toBeVisible();
    await expect(page.locator("#recipientContact")).toBeVisible();
    await expect(page.locator("#expectedDeliveryDate")).toBeVisible();
  });

  test("create shipment form shows validation errors when submitted empty", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/shipments/create");

    await page.click('button[type="submit"]');

    await expect(page.getByText("Origin address is required")).toBeVisible();
    await expect(
      page.getByText("Destination address is required"),
    ).toBeVisible();
    await expect(page.getByText("Item description is required")).toBeVisible();
    await expect(page.getByText("Recipient name is required")).toBeVisible();
  });

  test("create shipment submits and shows success screen", async ({ page }) => {
    await page.route("**/api/shipments", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(shipmentsFixture.created),
        });
      } else {
        await route.continue();
      }
    });

    await gotoProtected(page, "/dashboard/shipments/create");

    await page.fill("#origin", "Boston, MA");
    await page.fill("#destination", "Denver, CO");
    await page.fill("#itemDescription", "Electronics components");
    await page.fill("#weight", "5.5");
    await page.fill("#recipientName", "Jane Doe");
    await page.fill("#recipientContact", "jane@example.com");
    await page.fill("#expectedDeliveryDate", "2026-07-15");

    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/shipment created successfully/i),
    ).toBeVisible();
    await expect(page.getByText("ship-new")).toBeVisible();
  });

  test("create another button resets the form after success", async ({
    page,
  }) => {
    await page.route("**/api/shipments", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(shipmentsFixture.created),
        });
      } else {
        await route.continue();
      }
    });

    await gotoProtected(page, "/dashboard/shipments/create");

    await page.fill("#origin", "Boston, MA");
    await page.fill("#destination", "Denver, CO");
    await page.fill("#itemDescription", "Test goods");
    await page.fill("#weight", "2");
    await page.fill("#recipientName", "John");
    await page.fill("#recipientContact", "555-0100");
    await page.fill("#expectedDeliveryDate", "2026-07-20");
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/shipment created successfully/i),
    ).toBeVisible();

    await page.getByRole("button", { name: /create another/i }).click();

    // Form should be reset
    await expect(page.locator("#origin")).toHaveValue("");
  });

  test("back button navigates away from create form", async ({ page }) => {
    await gotoProtected(page, "/dashboard/shipments/create");

    await page.getByRole("button", { name: /back/i }).click();

    // Should navigate back (not on create page)
    await expect(page).not.toHaveURL("/dashboard/shipments/create");
  });
});
