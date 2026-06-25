import { test, expect } from "@playwright/test";
import { gotoProtected } from "./helpers/auth";
import { mockSettlements, mockAuth, blockTelemetry } from "./helpers/intercept";
import settlementsFixture from "./fixtures/settlements.json";

test.beforeEach(async ({ page }) => {
  await blockTelemetry(page);
  await mockAuth(page);
  await mockSettlements(page);
});

test.describe("Settlements", () => {
  test("settlements list renders with correct rows", async ({ page }) => {
    await gotoProtected(page, "/dashboard/settlements");

    for (const settlement of settlementsFixture.list.data) {
      await expect(page.getByText(settlement.shipmentId)).toBeVisible();
    }
  });

  test("status badges display correct labels", async ({ page }) => {
    await gotoProtected(page, "/dashboard/settlements");

    await expect(page.getByText("ESCROWED")).toBeVisible();
    await expect(page.getByText("RELEASED")).toBeVisible();
    await expect(page.getByText("PENDING")).toBeVisible();
    await expect(page.getByText("DISPUTED")).toBeVisible();
  });

  test("summary cards show totals", async ({ page }) => {
    await gotoProtected(page, "/dashboard/settlements");

    // Summary cards
    await expect(page.getByText(/total settled/i)).toBeVisible();
    await expect(page.getByText(/total records/i)).toBeVisible();
  });

  test("clicking a settlement row opens the Payment Detail Modal", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/settlements");

    // Click first settlement row (stl-001 / ship-001)
    await page.getByRole("row").filter({ hasText: "ship-001" }).click();

    // Modal should appear with settlement data
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
  });

  test("Payment Detail Modal shows shipment ID", async ({ page }) => {
    await gotoProtected(page, "/dashboard/settlements");

    await page.getByRole("row").filter({ hasText: "ship-001" }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 3000 });
    await expect(modal.getByText("ship-001")).toBeVisible();
  });

  test("Payment Detail Modal can be closed", async ({ page }) => {
    await gotoProtected(page, "/dashboard/settlements");

    await page.getByRole("row").filter({ hasText: "ship-001" }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 3000 });

    // Close via the close button (typical aria-label or role=button)
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible({ timeout: 2000 });
  });

  test("filter by settlement status — RELEASED only", async ({ page }) => {
    // Override to return only RELEASED settlements when filtered
    await page.route("**/api/settlements*", async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get("status") === "RELEASED") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...settlementsFixture.list,
            data: settlementsFixture.list.data.filter(
              (s) => s.status === "RELEASED",
            ),
            total: 1,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await gotoProtected(page, "/dashboard/settlements");

    const statusFilter = page.getByLabel("Filter by settlement status");
    await statusFilter.selectOption("RELEASED");

    // Only the RELEASED row should be present
    await expect(page.getByText("ship-002")).toBeVisible();
    await expect(page.getByText("ship-001")).not.toBeVisible();
  });

  test("sort toggle button changes sort order label", async ({ page }) => {
    await gotoProtected(page, "/dashboard/settlements");

    const sortBtn = page.getByLabel(/sort by date/i);
    await expect(sortBtn).toBeVisible();

    // Initial state should show "Newest"
    await expect(sortBtn).toContainText(/newest/i);

    await sortBtn.click();

    await expect(sortBtn).toContainText(/oldest/i);
  });

  test("pagination controls are present when there are multiple pages", async ({
    page,
  }) => {
    // Return more than one page of results
    await page.route("**/api/settlements*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...settlementsFixture.list,
          total: 25,
        }),
      });
    });

    await gotoProtected(page, "/dashboard/settlements");

    await expect(
      page.getByRole("button", { name: /previous page/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /next page/i }),
    ).toBeVisible();
  });

  test("previous page button is disabled on page 1", async ({ page }) => {
    await page.route("**/api/settlements*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...settlementsFixture.list, total: 25 }),
      });
    });

    await gotoProtected(page, "/dashboard/settlements");

    await expect(
      page.getByRole("button", { name: /previous page/i }),
    ).toBeDisabled();
  });

  test("next page button navigates to page 2", async ({ page }) => {
    const page2Data = {
      data: [
        {
          ...settlementsFixture.list.data[0],
          _id: "stl-005",
          id: "stl-005",
          shipmentId: "ship-005",
        },
      ],
      total: 25,
      page: 2,
      limit: 10,
    };

    let callCount = 0;
    await page.route("**/api/settlements*", async (route) => {
      callCount++;
      if (callCount > 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(page2Data),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...settlementsFixture.list, total: 25 }),
        });
      }
    });

    await gotoProtected(page, "/dashboard/settlements");

    await page.getByRole("button", { name: "2" }).click();

    await expect(page.getByText("ship-005")).toBeVisible();
  });
});
