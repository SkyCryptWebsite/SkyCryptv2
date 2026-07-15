import { devices, expect, test } from "@playwright/test";

test.describe("Profile Page", () => {
  test("should load profile page", async ({ page }) => {
    await page.goto("/stats/Technoblade");

    await expect(page).toHaveURL(/\/stats\//);
    await expect(page).toHaveTitle(/SkyCrypt/);
  });

  test("should display player name", async ({ page }) => {
    await page.goto("/stats/Technoblade");

    await expect(page.getByText("Technoblade").first()).toBeVisible({ timeout: 15000 });
  });

  test("should show loading state initially", async ({ page }) => {
    await page.goto("/stats/Technoblade");

    const loadingOrContent = page.getByText(/Loading profile|Technoblade/i);
    await expect(loadingOrContent.first()).toBeVisible({ timeout: 15000 });
  });

  test("should display profile content after loading", async ({ page }) => {
    await page.goto("/stats/Technoblade");

    await expect(page.locator("main")).toBeVisible({ timeout: 30000 });

    const mainContent = page.locator("main");
    const textContent = await mainContent.textContent();
    expect(textContent?.length).toBeGreaterThan(0);
  });

  test("should navigate back to home", async ({ page }) => {
    await page.goto("/stats/Technoblade");

    const homeLink = page.getByRole("link", { name: /SkyCrypt/i }).first();
    await expect(homeLink).toBeVisible({ timeout: 15000 });

    await homeLink.click();
    await page.waitForURL("/", { timeout: 5000 });
  });
});

test.describe("Mobile Profile Page", () => {
  test.use({
    viewport: devices["iPhone 12"].viewport,
    userAgent: devices["iPhone 12"].userAgent,
    deviceScaleFactor: devices["iPhone 12"].deviceScaleFactor,
    isMobile: devices["iPhone 12"].isMobile,
    hasTouch: devices["iPhone 12"].hasTouch
  });

  test("should show item drawer on touch devices", async ({ page }) => {
    await page.goto("/stats/DarthGigi/Banana#Gear");

    const dismissNewsroom = page.getByRole("button", { name: "Dismiss newsroom notifications" });
    await dismissNewsroom.click({ timeout: 1000 }).catch(() => undefined);

    const item = page
      .locator("main [data-tooltip-trigger]")
      .filter({ has: page.locator("img[alt]") })
      .first();
    await expect(item).toBeVisible({ timeout: 30000 });
    await item.click();

    const drawer = page.locator('[data-slot="drawer-content"]').filter({ has: page.locator("[data-mctooltip]") });

    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveCSS("position", "fixed");
    await expect(drawer).toBeInViewport();
    await expect(drawer.locator("[data-mctooltip]")).toBeVisible();
  });
});
