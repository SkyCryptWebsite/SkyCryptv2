import { describe, it } from "vitest";
import { render } from "vitest-browser-svelte";
import WithContext from "../../../test-utils/WithContext.svelte";
import Loadouts from "./Loadouts.svelte";

const loadouts = [
  {
    id: 0,
    name: "Mining Setup",
    armor: [],
    equipment: [],
    accessories: { tuningPoints: {}, tuningPointsSlot: 0 },
    miningCoreSelectedSlot: 0,
    foragingCoreSelectedSlot: 0
  }
];

describe.concurrent("Loadouts", () => {
  it("renders loadouts as horizontal cards", async ({ expect }) => {
    const { container } = await render(WithContext, {
      component: Loadouts,
      componentProps: { loadouts },
      withTooltipProvider: true
    });

    expect(container.textContent).toContain("Mining Setup");
    expect(container.textContent).toContain("None");

    const card = container.querySelector('[data-slot="loadout-card"]');
    expect(card?.querySelectorAll('[data-slot="gear-slot-column"]')).toHaveLength(2);
    expect(card?.querySelector('[aria-label="Empty pet slot"]')).toBeTruthy();

    expect(container.querySelector("button")).toBeNull();
  });
});
