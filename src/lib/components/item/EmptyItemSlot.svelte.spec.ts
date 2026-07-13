import { describe, it } from "vitest";
import { render } from "vitest-browser-svelte";
import EmptyItemSlot from "./EmptyItemSlot.svelte";

describe.concurrent("EmptyItemSlot", () => {
  it("maps equipment slots to their supplied asset", async ({ expect }) => {
    const { container } = await render(EmptyItemSlot, { slot: "gloves" });

    const slot = container.querySelector('[data-slot="empty-item-slot"]');
    expect(slot?.getAttribute("aria-label")).toBe("Empty gloves slot");
    expect(slot?.getAttribute("data-empty-slot")).toBe("gloves");
    expect(slot?.querySelector("div")?.getAttribute("style")).toContain("slot_gloves_alternate.avif");
  });

  it("maps the fishing placeholder to its supplied asset", async ({ expect }) => {
    const { container } = await render(EmptyItemSlot, { slot: "fishing" });

    const slot = container.querySelector('[data-slot="empty-item-slot"]');
    expect(slot?.querySelector("img")).toBeNull();
    expect(slot?.querySelector("div")?.getAttribute("style")).toContain("slot_fishing_rod.avif");
  });
});
