import { describe, it } from "vitest";
import { render } from "vitest-browser-svelte";
import WithContext from "../../../test-utils/WithContext.svelte";
import AdditionStat from "./AdditionStat.svelte";

describe.concurrent("AdditionStat Tests", () => {
  it("renders basic stat with text and data", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: AdditionStat,
      componentProps: {
        text: "strength",
        data: 100
      },
      withTooltipProvider: true
    });

    const item = container.querySelector('[data-slot="item"]');
    expect(item).toBeTruthy();
    expect(container.textContent).toContain("strength:");
    expect(container.textContent).toContain("100");
  });

  it("renders with subData", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: AdditionStat,
      componentProps: {
        text: "health",
        data: 500,
        subData: "+50"
      },
      withTooltipProvider: true
    });

    expect(container.textContent).toContain("health:");
    expect(container.textContent).toContain("500");
    expect(container.textContent).toContain("+50");
  });

  it("applies maxed class when maxed prop is true", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: AdditionStat,
      componentProps: {
        text: "crit damage",
        data: 300,
        maxed: true
      },
      withTooltipProvider: true
    });

    const item = container.querySelector('[data-slot="item"]');
    expect(item?.classList.contains("text-accent-2")).toBe(true);
  });

  it("applies accent color when dataMaxed is true", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: AdditionStat,
      componentProps: {
        text: "speed",
        data: 500,
        dataMaxed: true
      },
      withTooltipProvider: true
    });

    const span = container.querySelector('[data-slot="item-content"] span.text-accent-2');
    expect(span).toBeTruthy();
    expect(span?.textContent).toContain("500");
  });

  it("renders info tooltip indicator when asterisk prop is true", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: AdditionStat,
      componentProps: {
        text: "magic find",
        data: 123,
        asterisk: true
      },
      hoverEnabled: true,
      withTooltipProvider: true
    });

    const item = container.querySelector('[data-is-tooltip="true"]');
    const icon = container.querySelector('[data-slot="item-media"][data-variant="icon"] svg');
    expect(item).toBeTruthy();
    expect(icon).toBeTruthy();
  });

  it("applies custom class", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: AdditionStat,
      componentProps: {
        text: "defense",
        data: 200,
        class: "custom-test-class"
      },
      withTooltipProvider: true
    });

    const item = container.querySelector('[data-slot="item"]');
    expect(item?.classList.contains("custom-test-class")).toBe(true);
  });

  it("capitalizes text label", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: AdditionStat,
      componentProps: {
        text: "sea creature chance",
        data: 15
      },
      withTooltipProvider: true
    });

    const div = container.querySelector("div.capitalize");
    expect(div).toBeTruthy();
    expect(container.textContent).toContain("sea creature chance:");
  });

  it("renders without subData", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: AdditionStat,
      componentProps: {
        text: "intelligence",
        data: 800
      },
      withTooltipProvider: true
    });

    expect(container.textContent).toContain("intelligence:");
    expect(container.textContent).toContain("800");
    expect(container.textContent).not.toContain("+");
  });
});
