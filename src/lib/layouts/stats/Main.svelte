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
  import Slayer from "$lib/sections/stats/Slayer.svelte";
  import Weapons from "$lib/sections/stats/Weapons.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { setContext } from "svelte";

  export let profile;

  setContext<StatsType>("profile", profile);
</script>

<main class="mx-auto space-y-5 p-8">
  <PlayerProfile />
  <Skills />
  <div class="justify-center py-4 w-full text-1xl align-middle font-semibold inline-flex items-center bg-[#00000069]">
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#Stats"><p>Stats</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#AdditionalStats"><p>AdditionalStats</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#Armor"><p>Armor</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#Weapons"><p>Weapons</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#Accessories"><p>Accessories</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#Pets"><p>Pets</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#Inventory"><p>Inventory</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#SkillsSection"><p>SkillsSection</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#Dungeons"><p>Dungeons</p></a>
    <a class="px-4 border-lime-400 border-b-2 hover:border-b-4" href="#Slayer"><p>Slayer</p></a>
  </div>
  <Stats />
  <AdditionalStats />
  <Armor />
  <Weapons />
  <Accessories />
  <Pets />
  <Inventory />
  <SkillsSection />
  <Dungeons />
  <Slayer />
</main>

<svg xmlns="http://www.w3.org/2000/svg" height="0" width="0" style="position: fixed;">
  <filter id="enchanted-glint">
    <feImage href="/img/enchanted-glint.png" />
    <feComposite in2="SourceGraphic" operator="in" />
    <feBlend in="SourceGraphic" mode="screen" />
  </filter>
</svg>
