import { createRawSnippet } from "svelte";
import { describe, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import SettingToggleRow from "./SettingToggleRow.svelte";

const icon = createRawSnippet(() => ({ render: () => '<svg aria-hidden="true"></svg>' }));

describe("SettingToggleRow", () => {
  it("forwards its disabled state to the switch", async ({ expect }) => {
    const { container } = await render(SettingToggleRow, {
      icon,
      title: "Performance Mode",
      description: "Locked on",
      checked: true,
      disabled: true,
      id: "performance",
      onCheckedChange: vi.fn()
    });

    expect(container.querySelector('[data-slot="switch"]')?.getAttribute("data-disabled")).not.toBeNull();
  });
});
