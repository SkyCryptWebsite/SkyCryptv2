import { expect, test } from "@playwright/test";

test.describe("Error Handling", () => {
  test("should show error page for non-existent user", async ({ page }) => {
    await page.goto("/stats/zzNonExistent99");

    await expect(page.getByText(/Failed to resolve|Something went wrong|Oops/i)).toBeVisible({ timeout: 15000 });
  });

  test("should show error details with username", async ({ page }) => {
    await page.goto("/stats/zzNonExistent99");

    await expect(page.getByText(/zzNonExistent99/i)).toBeVisible({ timeout: 15000 });
  });

  test("should display error status code", async ({ page }) => {
    await page.goto("/stats/zzNonExistent99");

    await expect(page.getByText("400")).toBeVisible({ timeout: 15000 });
  });
});
