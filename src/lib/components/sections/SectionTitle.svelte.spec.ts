import { describe, it } from "vitest";
import { render } from "vitest-browser-svelte";
import SectionTitle from "./SectionTitle.svelte";

describe.concurrent("SectionTitle Tests", () => {
  it("renders with text prop", async ({ expect }) => {
    const { container } = await render(SectionTitle, { text: "Test Section" });

    const heading = container.querySelector("h3");
    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBe("Test Section");
  });

  it("applies default classes", async ({ expect }) => {
    const { container } = await render(SectionTitle, { text: "Test" });

    const heading = container.querySelector("h3");
    expect(heading?.classList.contains("text-2xl")).toBe(true);
    expect(heading?.classList.contains("mt-4")).toBe(true);
    expect(heading?.classList.contains("font-semibold")).toBe(true);
    expect(heading?.classList.contains("uppercase")).toBe(true);
  });

  it("applies custom class via class prop", async ({ expect }) => {
    const { container } = await render(SectionTitle, {
      text: "Custom",
      class: "custom-class"
    });

    const heading = container.querySelector("h3");
    expect(heading?.classList.contains("custom-class")).toBe(true);
    // Should still have default classes
    expect(heading?.classList.contains("text-2xl")).toBe(true);
  });

  it.skip("renders with children snippet (snippet testing not supported)", async ({ expect }) => {
    expect(true).toBe(true);
  });

  it.skip("prioritizes children over text prop (snippet testing not supported)", async ({ expect }) => {
    expect(true).toBe(true);
  });

  it("renders empty heading when neither text nor children provided", async ({ expect }) => {
    const { container } = await render(SectionTitle, {});

    const heading = container.querySelector("h3");
    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBe("");
  });

  it("handles complex class merging via cn()", async ({ expect }) => {
    const { container } = await render(SectionTitle, {
      text: "Test",
      class: "mt-10 text-2xl"
    });

    const heading = container.querySelector("h3");
    // cn() should merge and deduplicate classes (via twMerge)
    expect(heading?.classList.contains("mt-10")).toBe(true);
    expect(heading?.classList.contains("text-2xl")).toBe(true);
  });

  it("renders h3 element", async ({ expect }) => {
    const { container } = await render(SectionTitle, { text: "Test" });

    const heading = container.querySelector("h3");
    expect(heading?.tagName).toBe("H3");
  });
});
