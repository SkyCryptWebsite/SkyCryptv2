import { devices, expect, test, type Page } from "@playwright/test";

const inventoryRemotePattern = /\/_app\/remote\/.*\/getProfileInventory(?:\?|$)/;

async function expectRapidInventorySwitchToStayResponsive(page: Page) {
  const runtimeErrors: string[] = [];
  let inventoryRequestSeen = false;
  let finishInventoryRequest!: () => void;
  const inventoryRequestFinished = new Promise<void>((resolve) => {
    finishInventoryRequest = resolve;
  });

  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /Batch has scheduled roots|invariant_violation|derived_inert|Unhandled promise rejection/i.test(message.text())
    ) {
      runtimeErrors.push(message.text());
    }
  });

  await page.route(inventoryRemotePattern, async (route) => {
    inventoryRequestSeen = true;

    try {
      const response = await route.fetch();
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({ response });
    } finally {
      finishInventoryRequest();
    }
  });

  await page.goto("/stats/Technoblade/Watermelon#Gear");

  const dismissNewsroom = page.getByRole("button", { name: "Dismiss newsroom notifications" });
  await dismissNewsroom.click({ timeout: 1000 }).catch(() => undefined);
  await page.evaluate(async () => {
    await Promise.all((await caches.keys()).map((cacheName) => caches.delete(cacheName)));
  });

  const inventoryButton = page.locator('button[data-id="Inventory"]');
  const petsButton = page.locator('button[data-id="Pets"]');
  await expect(inventoryButton).toBeVisible({ timeout: 30000 });

  await inventoryButton.click();
  await expect.poll(() => inventoryRequestSeen).toBe(true);
  await expect(page).toHaveURL(/#Inventory$/);
  await expect(page.getByText("Loading Inventory Data")).toBeVisible();

  await petsButton.click();
  await expect(page.locator('[data-section="Pets"]')).toBeVisible({ timeout: 2000 });
  await expect(page).toHaveURL(/#Pets$/);

  await inventoryRequestFinished;
  await expect(page.locator('[data-section="Pets"]')).toBeVisible();
  expect(runtimeErrors).toEqual([]);

  await inventoryButton.click();
  await expect(page.locator('[data-section="Inventory"]')).toBeVisible({ timeout: 2000 });
  await expect(page.getByRole("tab", { name: "Inventory", exact: true })).toBeVisible({ timeout: 5000 });
  await expect(page).toHaveURL(/#Inventory$/);
  expect(runtimeErrors).toEqual([]);
}

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

  test("should switch away from inventory while it is loading", async ({ page }) => {
    await expectRapidInventorySwitchToStayResponsive(page);
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

  test("should switch away from inventory while it is loading", async ({ page }) => {
    await expectRapidInventorySwitchToStayResponsive(page);
  });
});
