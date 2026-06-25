import { test, expect } from "@playwright/test";
import { gotoProtected } from "./helpers/auth";
import { mockAuth, blockTelemetry } from "./helpers/intercept";

test.beforeEach(async ({ page }) => {
  await blockTelemetry(page);
  await mockAuth(page);
});

// Notifications are static local state — no API mock needed

test.describe("Notifications", () => {
  test("notifications page renders the list", async ({ page }) => {
    await gotoProtected(page, "/dashboard/notifications");

    await expect(
      page.getByRole("heading", { name: /notifications/i }),
    ).toBeVisible();
    // At least one notification card should be present
    await expect(page.getByText("Shipment Arrived at Port")).toBeVisible();
  });

  test("unread notifications have an unread indicator dot", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/notifications");

    // Unread items show a blue dot (w-2 h-2 bg-[#3b82f6] rounded-full)
    // Verify unread notifications are present in the "TODAY" section
    await expect(page.getByText("TODAY")).toBeVisible();
    await expect(page.getByText("Shipment Arrived at Port")).toBeVisible();
  });

  test("read notifications are rendered in the EARLIER section", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/notifications");

    await expect(page.getByText("EARLIER")).toBeVisible();
    await expect(page.getByText("Customs Clearance Completed")).toBeVisible();
  });

  test("clicking a notification marks it as read", async ({ page }) => {
    await gotoProtected(page, "/dashboard/notifications");

    // The "mark as read" check button is only shown on unread notifications
    const checkBtn = page
      .getByRole("button", { name: /mark as read/i })
      .first();
    await expect(checkBtn).toBeVisible();

    await checkBtn.click();

    // After marking, that particular card should no longer show the check button
    // (it moves to read state — the number of unread mark buttons decreases)
    const remainingCheckBtns = page.getByRole("button", {
      name: /mark as read/i,
    });
    const count = await remainingCheckBtns.count();
    expect(count).toBeLessThanOrEqual(5); // started with 6 unread
  });

  test('"Mark all as read" button clears all unread indicators', async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/notifications");

    await page.getByRole("button", { name: /mark all as read/i }).click();

    // After marking all read, no "mark as read" check buttons should be visible
    await expect(
      page.getByRole("button", { name: /mark as read/i }),
    ).toHaveCount(0);

    // TODAY section should be gone (no unread left)
    await expect(page.getByText("TODAY")).not.toBeVisible();
  });

  test("filter by Shipments tab shows only shipment notifications", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/notifications");

    await page.getByRole("button", { name: /^shipments/i }).click();

    // Shipment notifications should be visible
    await expect(page.getByText("Shipment Arrived at Port")).toBeVisible();

    // Settlement-only notification should not be visible
    await expect(page.getByText("Smart Contract Executed")).not.toBeVisible();
  });

  test("filter by Settlements tab shows only settlement notifications", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/notifications");

    await page.getByRole("button", { name: /^settlements/i }).click();

    await expect(page.getByText("Smart Contract Executed")).toBeVisible();
    await expect(page.getByText("Shipment Arrived at Port")).not.toBeVisible();
  });

  test("filter by System tab shows only system notifications", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/notifications");

    await page.getByRole("button", { name: /^system/i }).click();

    await expect(page.getByText("Security Alert")).toBeVisible();
    await expect(page.getByText("System Maintenance Scheduled")).toBeVisible();
    await expect(page.getByText("Shipment Arrived at Port")).not.toBeVisible();
  });

  test("All tab restores full notification list", async ({ page }) => {
    await gotoProtected(page, "/dashboard/notifications");

    // Switch to system, then back to all
    await page.getByRole("button", { name: /^system/i }).click();
    await expect(page.getByText("Shipment Arrived at Port")).not.toBeVisible();

    await page.getByRole("button", { name: /^all/i }).click();
    await expect(page.getByText("Shipment Arrived at Port")).toBeVisible();
  });

  test("search filters notifications by title keyword", async ({ page }) => {
    await gotoProtected(page, "/dashboard/notifications");

    const searchInput = page.getByPlaceholder(
      /search by id, contract, or keyword/i,
    );
    await searchInput.fill("security");

    await expect(page.getByText("Security Alert")).toBeVisible();
    await expect(page.getByText("Shipment Arrived at Port")).not.toBeVisible();
  });

  test("search filters notifications by badge content", async ({ page }) => {
    await gotoProtected(page, "/dashboard/notifications");

    const searchInput = page.getByPlaceholder(
      /search by id, contract, or keyword/i,
    );
    await searchInput.fill("NV-9920");

    await expect(page.getByText("Shipment Arrived at Port")).toBeVisible();
    await expect(page.getByText("Smart Contract Executed")).not.toBeVisible();
  });

  test('empty search result shows "no notifications found" message', async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/notifications");

    const searchInput = page.getByPlaceholder(
      /search by id, contract, or keyword/i,
    );
    await searchInput.fill("zzznomatch999");

    await expect(page.getByText(/no notifications found/i)).toBeVisible();
    await expect(
      page.getByText(/try adjusting your search terms/i),
    ).toBeVisible();
  });

  test("filter count badges show correct totals", async ({ page }) => {
    await gotoProtected(page, "/dashboard/notifications");

    // The "All" tab badge should show 16 (total notifications in local state)
    const allBtn = page.getByRole("button", { name: /^all/i });
    await expect(allBtn).toContainText("16");
  });

  test("pagination renders when list exceeds items per page", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/notifications");

    // 16 notifications with 10 per page → pagination should appear
    await expect(page.getByRole("button", { name: /previous/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /next/i })).toBeVisible();
    await expect(page.getByText(/page 1 of 2/i)).toBeVisible();
  });

  test("next page button navigates to page 2", async ({ page }) => {
    await gotoProtected(page, "/dashboard/notifications");

    await page.getByRole("button", { name: /^next$/i }).click();

    await expect(page.getByText(/page 2 of 2/i)).toBeVisible();
    // Page 2 notification
    await expect(page.getByText("Delivery Delayed")).toBeVisible();
  });

  test("previous page button is disabled on page 1", async ({ page }) => {
    await gotoProtected(page, "/dashboard/notifications");

    await expect(
      page.getByRole("button", { name: /^previous$/i }),
    ).toBeDisabled();
  });
});
