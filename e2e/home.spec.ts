import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display validation error for invalid username", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Enter username");
    await searchInput.fill("!!invalid!!");
    await searchInput.press("Tab");

    await expect(page.getByText(/Please enter a valid Minecraft username or UUID/i)).toBeVisible();
  });
});
