<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { getCombinedContext, setSkillsContext, SkillsContext } from "$ctx";
  import { ScrollItems } from "$lib/components/misc";
  import { Section } from "$lib/components/sections";
  import * as Tabs from "$ui/tabs";
  import { type Icon } from "@lucide/svelte";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import FishIcon from "@lucide/svelte/icons/fish";
  import PickaxeIcon from "@lucide/svelte/icons/pickaxe";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import TreesIcon from "@lucide/svelte/icons/trees";
  import WheatIcon from "@lucide/svelte/icons/wheat";
  import { PersistedState } from "runed";
  import type { Component } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { CurrentTabContext, setCurrentTabContext } from "./skills/current-tab-context.svelte";
  import Enchanting from "./skills/enchanting.svelte";
  import Farming from "./skills/farming.svelte";
  import Fishing from "./skills/fishing.svelte";
  import Foraging from "./skills/foraging.svelte";
  import Hunting from "./skills/hunting.svelte";
  import Mining from "./skills/mining.svelte";
  import { TabNamesEnum, type TabNames } from "./types";

  type SkillTab = {
    name: string;
    component: Component<Record<string, never>>;
    available: boolean | undefined;
    icon: typeof Icon;
  };

  let { order }: { order: number } = $props();

  const skillsContext = new SkillsContext();
  setSkillsContext(skillsContext);
  const currentTabContext = new CurrentTabContext();
  setCurrentTabContext(currentTabContext);

  const skills = $derived(getCombinedContext().current?.skills);
  const skillTabs = $derived([
    { name: TabNamesEnum.Mining, component: Mining, available: !!skills?.mining, icon: PickaxeIcon },
    { name: TabNamesEnum.Foraging, component: Foraging, available: !!skills?.foraging, icon: TreesIcon },
    { name: TabNamesEnum.Farming, component: Farming, available: !!skills?.farming, icon: WheatIcon },
    { name: TabNamesEnum.Fishing, component: Fishing, available: !!skills?.fishing, icon: FishIcon },
    { name: TabNamesEnum.Enchanting, component: Enchanting, available: !!skills?.enchanting, icon: SparklesIcon },
    { name: TabNamesEnum.Hunting, component: Hunting, available: !!skills?.hunting, icon: CrosshairIcon }
  ]) satisfies SkillTab[];

  const selectedTabState = new PersistedState<TabNames | null>("skillsActiveTab", null, {
    storage: "session",
    syncTabs: false
  });
  const availableTabNames = $derived(skillTabs.filter((tab) => tab.available).map((tab) => tab.name as TabNames));
  const tabValue = $derived.by(() => {
    if (selectedTabState.current && availableTabNames.includes(selectedTabState.current)) {
      return selectedTabState.current;
    }

    return availableTabNames[0] ?? null;
  });

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicOut
  });

  beforeNavigate(({ willUnload }) => {
    if (willUnload) selectedTabState.current = null;
  });

  $effect(() => {
    skillsContext.skills = skills ?? null;
  });

  $effect(() => {
    currentTabContext.current = tabValue;
  });
</script>

<Section id="Skills" {order}>
  {#if skills}
    <Tabs.Root bind:value={() => tabValue?.toString(), (v) => (selectedTabState.current = v as TabNames)} class="gap-4">
      <ScrollItems>
        <Tabs.List
          class="relative mx-auto flex h-auto! w-fit items-center justify-center gap-1 overflow-clip rounded-full border bg-transparent text-base">
          {#each skillTabs as tab (tab.name)}
            {#if tab.available}
              {const isActive = $derived(tabValue === tab.name)}
              <Tabs.Trigger
                value={tab.name}
                class="relative isolate h-auto px-4 py-2 font-semibold text-white data-[state=active]:bg-transparent!">
                {#if isActive}
                  <div
                    class="absolute inset-0 rounded-full bg-primary/40"
                    in:send={{ key: "active-tab" }}
                    out:receive={{ key: "active-tab" }}>
                  </div>
                {/if}
                <div class="relative z-10 flex flex-col items-center justify-center text-base">
                  <tab.icon class="size-6" />
                  <span class="capitalize">{tab.name}</span>
                </div>
              </Tabs.Trigger>
            {/if}
          {/each}
        </Tabs.List>
      </ScrollItems>
      {#each skillTabs as tab (tab.name)}
        {#if tab.name === tabValue}
          <div class="relative overflow-clip">
            <Tabs.Content value={tab.name}>
              <tab.component />
            </Tabs.Content>
          </div>
        {/if}
      {/each}
    </Tabs.Root>
  {/if}
</Section>
