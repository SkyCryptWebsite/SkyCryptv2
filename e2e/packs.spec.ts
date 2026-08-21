import { devices, expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test";

const defaultPackOrder = ["HYPIXEL_PLUS", "FSR", "HYPIXEL_PACK"];

function packRow(page: Page, packId: string): Locator {
  return page.locator(`[data-slot="resource-pack-row"][data-pack-id="${packId}"]`);
}

async function packIds(section: Locator): Promise<string[]> {
  return section.locator('[data-slot="resource-pack-row"]').evaluateAll((rows) =>
    rows.flatMap((row) => {
      const packId = row.getAttribute("data-pack-id");
      return packId ? [packId] : [];
    })
  );
}

async function enabledPacksCookie(context: BrowserContext): Promise<string[]> {
  const cookie = (await context.cookies()).find(({ name }) => name === "enabledPacks");
  expect(cookie).toBeDefined();
  return JSON.parse(decodeURIComponent(cookie!.value)) as string[];
}

test.describe("Resource pack settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('header [data-slot="dialog-trigger"]').click();
    await page.getByRole("tab", { name: "Packs" }).click();
    await expect(page.locator('[data-slot="enabled-packs"]')).toBeVisible();
  });

  test("shows default priority and moves toggled packs between groups", async ({ context, page }) => {
    const enabledSection = page.locator('[data-slot="enabled-packs"]');
    const disabledSection = page.locator('[data-slot="disabled-packs"]');

    await expect.poll(() => packIds(enabledSection)).toEqual(defaultPackOrder);
    expect(await enabledPacksCookie(context)).toEqual(defaultPackOrder);

    await packRow(page, "FSR").locator('[data-slot="switch"]').click();

    await expect(packRow(page, "FSR")).toHaveAttribute("data-enabled", "false");
    await expect(disabledSection).toContainText("FurSky Reborn");
    expect(await enabledPacksCookie(context)).toEqual(["HYPIXEL_PLUS", "HYPIXEL_PACK"]);
    await expect(page.getByRole("button", { name: "Reload to apply changes" })).toBeVisible();

    await packRow(page, "FSR").locator('[data-slot="switch"]').click();

    await expect.poll(() => packIds(enabledSection)).toEqual(["HYPIXEL_PLUS", "HYPIXEL_PACK", "FSR"]);
    expect(await enabledPacksCookie(context)).toEqual(["HYPIXEL_PLUS", "HYPIXEL_PACK", "FSR"]);
  });

  test("reorders enabled packs with the keyboard", async ({ context, page }) => {
    const enabledSection = page.locator('[data-slot="enabled-packs"]');
    const handle = packRow(page, "HYPIXEL_PLUS").getByRole("button", { name: "Reorder Hypixel Plus" });

    await handle.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");

    await expect.poll(() => packIds(enabledSection)).toEqual(["FSR", "HYPIXEL_PLUS", "HYPIXEL_PACK"]);
    expect(await enabledPacksCookie(context)).toEqual(["FSR", "HYPIXEL_PLUS", "HYPIXEL_PACK"]);
  });

  test("reorders enabled packs with a pointer drag", async ({ context, page }) => {
    const enabledSection = page.locator('[data-slot="enabled-packs"]');
    const handle = packRow(page, "HYPIXEL_PLUS").getByRole("button", { name: "Reorder Hypixel Plus" });
    const target = packRow(page, "FSR");
    const handleBox = await handle.boundingBox();
    const targetBox = await target.boundingBox();

    expect(handleBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox!.x + targetBox!.width / 2, targetBox!.y + targetBox!.height - 4, { steps: 10 });
    await page.mouse.up();

    await expect.poll(() => packIds(enabledSection)).toEqual(["FSR", "HYPIXEL_PLUS", "HYPIXEL_PACK"]);
    expect(await enabledPacksCookie(context)).toEqual(["FSR", "HYPIXEL_PLUS", "HYPIXEL_PACK"]);
  });

  test("supports vanilla-only and keeps links independent from dragging", async ({ context, page }) => {
    const hypixelPlusLink = packRow(page, "HYPIXEL_PLUS").getByRole("link", { name: "Hypixel Plus" });
    await expect(hypixelPlusLink).toHaveAttribute("href", "https://modrinth.com/resourcepack/hypixel-plus");

    for (const packId of defaultPackOrder) {
      await packRow(page, packId).locator('[data-slot="switch"]').click();
    }

    await expect(page.getByText("Vanilla textures only")).toBeVisible();
    expect(await enabledPacksCookie(context)).toEqual([]);
    await expect(page.getByRole("button", { name: "Reload to apply changes" })).toBeVisible();
  });
});

test.describe("Mobile resource pack settings", () => {
  test.use({
    viewport: devices["iPhone 12"].viewport,
    userAgent: devices["iPhone 12"].userAgent,
    deviceScaleFactor: devices["iPhone 12"].deviceScaleFactor,
    isMobile: devices["iPhone 12"].isMobile,
    hasTouch: devices["iPhone 12"].hasTouch
  });

  test("opens in a drawer and reorders with touch", async ({ context, page }) => {
    await page.goto("/");
    await expect
      .poll(async () => {
        const cookie = (await context.cookies()).find(({ name }) => name === "enabledPacks");
        return cookie ? (JSON.parse(decodeURIComponent(cookie.value)) as string[]) : null;
      })
      .toEqual(defaultPackOrder);

    const trigger = page.locator('header [data-slot="drawer-trigger"]');
    await trigger.click();
    await expect(trigger).toHaveAttribute("data-state", "open");

    const enabledSection = page.locator('[data-slot="enabled-packs"]');
    const drawer = page.locator('[data-slot="drawer-content"]').filter({ has: enabledSection });
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveCSS("position", "fixed");
    await expect(drawer).toBeInViewport();

    const handle = packRow(page, "HYPIXEL_PLUS").getByRole("button", { name: "Reorder Hypixel Plus" });
    const target = packRow(page, "FSR");
    await handle.scrollIntoViewIfNeeded();
    const handleBox = await handle.evaluate((element) => element.getBoundingClientRect().toJSON());
    const targetBox = await target.evaluate((element) => element.getBoundingClientRect().toJSON());

    const session = await context.newCDPSession(page);
    const start = {
      x: handleBox.x + handleBox.width / 2,
      y: handleBox.y + handleBox.height / 2
    };
    const end = {
      x: targetBox.x + targetBox.width / 2,
      y: targetBox.y + targetBox.height - 4
    };
    expect(
      await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.getAttribute("aria-label"),
        start
      )
    ).toBe("Reorder Hypixel Plus");

    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...start, radiusX: 1, radiusY: 1, force: 1 }]
    });
    await page.waitForTimeout(300);
    for (let step = 1; step <= 10; step += 1) {
      const progress = step / 10;
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          {
            x: start.x + (end.x - start.x) * progress,
            y: start.y + (end.y - start.y) * progress,
            radiusX: 1,
            radiusY: 1,
            force: 1
          }
        ]
      });
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(100);
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await session.detach();

    await expect.poll(() => packIds(enabledSection)).toEqual(["FSR", "HYPIXEL_PLUS", "HYPIXEL_PACK"]);
    expect(await enabledPacksCookie(context)).toEqual(["FSR", "HYPIXEL_PLUS", "HYPIXEL_PACK"]);

    await packRow(page, "FSR").locator('[data-slot="switch"]').tap();
    await expect(packRow(page, "FSR")).toHaveAttribute("data-enabled", "false");
  });
});
