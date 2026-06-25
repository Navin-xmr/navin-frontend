import { test, expect } from "@playwright/test";
import { gotoProtected } from "./helpers/auth";
import { mockLedger, mockAuth, blockTelemetry } from "./helpers/intercept";
import ledgerFixture from "./fixtures/ledger.json";

test.beforeEach(async ({ page }) => {
  await blockTelemetry(page);
  await mockAuth(page);
  await mockLedger(page);
});

test.describe("Blockchain Ledger", () => {
  test("ledger table loads and renders block rows", async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    // Table should be present
    await expect(
      page.getByRole("table", { name: /blockchain ledger/i }),
    ).toBeVisible();

    // First page blocks should be visible
    for (const block of ledgerFixture.page1.data) {
      await expect(page.getByText(block.shipmentReference)).toBeVisible();
    }
  });

  test("block number is displayed with # prefix", async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    await expect(page.getByText("#100")).toBeVisible();
    await expect(page.getByText("#101")).toBeVisible();
  });

  test("milestone event badges are displayed", async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    await expect(page.getByText("Shipment Created")).toBeVisible();
    await expect(page.getByText("In Transit")).toBeVisible();
    await expect(page.getByText("Delivered")).toBeVisible();
  });

  test('verified blocks show "Verified" status', async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    await expect(page.getByText("Verified").first()).toBeVisible();
  });

  test("transaction hash is truncated in the table", async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    const hash = ledgerFixture.page1.data[0].transactionHash;
    const truncated = `${hash.slice(0, 8)}...${hash.slice(-8)}`;

    // The full hash should NOT be visible as plain text
    await expect(page.getByText(hash)).not.toBeVisible();
    // The truncated version should be visible inside a link
    await expect(page.getByText(truncated)).toBeVisible();
  });

  test("transaction hash links open Stellar Expert in a new tab", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    const hash = ledgerFixture.page1.data[0].transactionHash;
    const txLink = page.locator(`a[href*="${hash}"]`).first();
    await expect(txLink).toBeVisible();
    await expect(txLink).toHaveAttribute("target", "_blank");
    await expect(txLink).toHaveAttribute(
      "href",
      new RegExp("stellar\\.expert"),
    );
  });

  test('"Next" button fetches the next cursor page', async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    // Wait for first page to load
    await expect(page.getByText("#100")).toBeVisible();

    // Click next page
    await page.getByRole("button", { name: /load next page|^next$/i }).click();

    // Second page block should appear
    await expect(page.getByText("#103")).toBeVisible();
    await expect(page.getByText("Settlement Completed")).toBeVisible();
  });

  test('"Previous" button is disabled on the first page', async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    await expect(
      page.getByRole("button", { name: /previous page|^previous$/i }),
    ).toBeDisabled();
  });

  test('"Previous" button navigates back to page 1', async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    await expect(page.getByText("#100")).toBeVisible();
    await page.getByRole("button", { name: /load next page|^next$/i }).click();
    await expect(page.getByText("#103")).toBeVisible();

    await page
      .getByRole("button", { name: /previous page|^previous$/i })
      .click();
    await expect(page.getByText("#100")).toBeVisible();
  });

  test("filter by milestone event resets to page 1", async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    // Navigate to page 2 first
    await expect(page.getByText("#100")).toBeVisible();
    await page.getByRole("button", { name: /load next page|^next$/i }).click();
    await expect(page.getByText("#103")).toBeVisible();

    // Apply a filter — should reset pagination and re-fetch
    await page.click("#ledger-filter-delivered");

    // Page indicator should show page 1
    await expect(page.getByText(/page 1/i)).toBeVisible();
  });

  test("filter buttons render for all milestone event types", async ({
    page,
  }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    await expect(
      page.getByRole("button", { name: "All Events" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "In Transit" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Delivered" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Settlement Completed" }),
    ).toBeVisible();
  });

  test("refresh button triggers a new API fetch", async ({ page }) => {
    let fetchCount = 0;
    await page.route("**/api/ledger/blocks*", async (route) => {
      fetchCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ledgerFixture.page1),
      });
    });

    await gotoProtected(page, "/dashboard/blockchain-ledger");
    await expect(page.getByText("#100")).toBeVisible();

    const beforeCount = fetchCount;
    await page.click("#ledger-refresh-btn");
    await page.waitForTimeout(200);

    expect(fetchCount).toBeGreaterThan(beforeCount);
  });

  test("total blocks count is displayed in stats bar", async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    // ledgerFixture.page1.total = 10
    await expect(page.getByText("10")).toBeVisible();
  });

  test("network label shows Stellar Mainnet", async ({ page }) => {
    await gotoProtected(page, "/dashboard/blockchain-ledger");

    await expect(page.getByText("Stellar Mainnet")).toBeVisible();
  });

  test("error banner renders when API fails", async ({ page }) => {
    await page.route("**/api/ledger/blocks*", async (route) => {
      await route.fulfill({ status: 500, body: "Internal Server Error" });
    });

    await gotoProtected(page, "/dashboard/blockchain-ledger");

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 3000 });
    await expect(
      page.getByText(/failed to load blockchain ledger/i),
    ).toBeVisible();
  });
});
