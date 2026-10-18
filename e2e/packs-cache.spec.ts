import { expect, test } from "@playwright/test";

test("uses a versioned prerendered catalog without resetting saved pack choices", async ({ page }) => {
  const responsePromise = page.waitForResponse((response) => response.url().includes("/listResourcePacks"));
  await page.goto("/");
  const response = await responsePromise;
  const catalogUrl = response.url();
  expect(response.status()).toBe(200);
  expect(new URL(catalogUrl).pathname).toMatch(/\/listResourcePacks\/[^/]+$/);

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("tab", { name: /^packs$/i }).click();
  const rows = page.locator('[data-slot="resource-pack-row"]');
  await expect(rows.first()).toBeVisible();
  const ids = await rows.evaluateAll((elements) => elements.map((element) => element.getAttribute("data-pack-id")));

  await page.evaluate(async (url) => {
    localStorage.setItem("skycryptEnabledPacks", JSON.stringify(["FSR"]));
    document.cookie = `enabledPacks=${encodeURIComponent(JSON.stringify(["FSR"]))}; path=/`;
    const unversionedUrl = url.slice(0, url.indexOf("/listResourcePacks") + "/listResourcePacks".length);
    for (const name of await caches.keys()) {
      if (!name.startsWith("sveltekit:")) continue;
      const cache = await caches.open(name);
      await cache.delete(url);
      // Old releases cached this URL without any build identifier.
      await cache.put(unversionedUrl, new Response("[[]]"));
    }
    await (await caches.open("sveltekit:previous-build")).put(unversionedUrl, new Response("[[]]"));
  }, catalogUrl);

  const refreshed = page.waitForResponse((response) => response.url() === catalogUrl);
  await page.reload();
  expect((await refreshed).status()).toBe(200);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("tab", { name: /^packs$/i }).click();
  await expect(rows).toHaveCount(ids.length);
  for (const id of ids) {
    await expect(page.locator(`[data-slot="resource-pack-row"][data-pack-id="${id}"]`)).toHaveAttribute(
      "data-enabled",
      id === "FSR" ? "true" : "false"
    );
  }
  expect(await page.evaluate(() => caches.keys())).not.toContain("sveltekit:previous-build");
});
