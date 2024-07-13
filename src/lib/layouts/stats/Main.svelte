<script lang="ts">
  import AdditionalStats from "$lib/layouts/stats/AdditionalStats.svelte";
  import PlayerProfile from "$lib/layouts/stats/PlayerProfile.svelte";
  import Skills from "$lib/layouts/stats/Skills.svelte";
  import Stats from "$lib/layouts/stats/Stats.svelte";
  import Accessories from "$lib/sections/stats/Accessories.svelte";
  import Armor from "$lib/sections/stats/Armor.svelte";
  import Dungeons from "$lib/sections/stats/Dungeons.svelte";
  import Inventory from "$lib/sections/stats/Inventory.svelte";
  import Pets from "$lib/sections/stats/Pets.svelte";
  import SkillsSection from "$lib/sections/stats/SkillsSection.svelte";
  import Weapons from "$lib/sections/stats/Weapons.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { setContext } from "svelte";

  export let profile;

  setContext<StatsType>("profile", profile);
</script>

<main class="mx-auto space-y-5 p-8">
  <PlayerProfile />
  <Skills />
  <Stats />
  <AdditionalStats />
  <Armor />
  <Weapons />
  <Accessories />
  <Pets />
  <Inventory />
  <SkillsSection />
  <Dungeons />
</main>

<svg xmlns="http://www.w3.org/2000/svg" height="0" width="0" style="position: fixed;">
  <filter id="enchanted-glint">
    <feImage href="/img/enchanted-glint.png" />
    <feComposite in2="SourceGraphic" operator="in" />
    <feBlend in="SourceGraphic" mode="screen" />
  </filter>
</svg>
