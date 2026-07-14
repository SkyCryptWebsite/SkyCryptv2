import type { ModelsStrippedItem } from "$lib/shared/api/orval-generated";
import { describe, it } from "vitest";
import { render } from "vitest-browser-svelte";
import WithContext from "../../../test-utils/WithContext.svelte";
import SkillGear from "./SkillGear.svelte";

const item = (name: string): ModelsStrippedItem => ({ display_name: name, texture_path: "" });

describe.concurrent("SkillGear", () => {
  it("renders the fixed 4/4/4/2 column capacity and truncates sorted arrays", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: SkillGear,
      componentProps: {
        skill: "mining",
        gear: {
          tools: [item("Tool 1"), item("Tool 2"), item("Tool 3"), item("Tool 4"), item("Tool 5")],
          misc: [item("Misc 1"), item("Misc 2"), item("Misc 3")]
        }
      },
      withTooltipProvider: true
    });

    const columns = Array.from(container.querySelectorAll('[data-slot="gear-slot-column"]'));
    expect(columns).toHaveLength(4);
    expect(columns.map((column) => column.querySelectorAll('[data-slot="gear-slot-item"], [data-slot="empty-item-slot"]').length)).toEqual([4, 4, 4, 2]);
    expect(columns[2].querySelectorAll('[data-slot="gear-slot-item"]')).toHaveLength(4);
    expect(columns[3].querySelectorAll('[data-slot="gear-slot-item"]')).toHaveLength(2);
  });

  it("uses the mining pickaxe placeholder for empty tool positions", async ({ expect }) => {
    const { container } = await render(SkillGear, { skill: "mining", gear: {} });

    const columns = Array.from(container.querySelectorAll('[data-slot="gear-slot-column"]'));
    expect(columns[2].querySelectorAll('[data-empty-slot="pickaxe"]')).toHaveLength(4);
    expect(columns[3].querySelectorAll('[data-empty-slot="backpack"]')).toHaveLength(2);
  });
});
