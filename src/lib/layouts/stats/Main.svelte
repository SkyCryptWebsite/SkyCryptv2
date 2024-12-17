<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Skin3D from "$lib/components/Skin3D.svelte";
  import AdditionalStats from "$lib/layouts/stats/AdditionalStats.svelte";
  import PlayerProfile from "$lib/layouts/stats/PlayerProfile.svelte";
  import Skills from "$lib/layouts/stats/Skills.svelte";
  import Stats from "$lib/layouts/stats/Stats.svelte";
  import Accessories from "$lib/sections/stats/Accessories.svelte";
  import Armor from "$lib/sections/stats/Armor.svelte";
  import Bestiary from "$lib/sections/stats/Bestiary.svelte";
  import Collections from "$lib/sections/stats/Collections.svelte";
  import CrimsonIsle from "$lib/sections/stats/CrimsonIsle.svelte";
  import Dungeons from "$lib/sections/stats/Dungeons.svelte";
  import Inventory from "$lib/sections/stats/Inventory.svelte";
  import Minions from "$lib/sections/stats/Minions.svelte";
  import MiscSection from "$lib/sections/stats/MiscSection.svelte";
  import Pets from "$lib/sections/stats/Pets.svelte";
  import Rift from "$lib/sections/stats/Rift.svelte";
  import SkillsSection from "$lib/sections/stats/SkillsSection.svelte";
  import Slayer from "$lib/sections/stats/Slayer.svelte";
  import Weapons from "$lib/sections/stats/Weapons.svelte";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { setContext } from "svelte";

  export let profile;

  setContext<StatsType>("profile", profile);
</script>

<div class="relative">
  {#await profile}
    Loading
  {:then}
    <Skin3D class="fixed left-0 top-1/2 z-10 h-dvh w-[30vw] -translate-y-1/2" />
  {/await}
  <div class="fixed right-0 top-0 h-dvh w-[calc(100%-30vw)] backdrop-blur-lg backdrop-brightness-50"></div>
  <main class="relative mx-auto ml-[30vw]">
    <div class="space-y-5 p-8">
      <PlayerProfile />
      <Skills />
      <Stats />
      <AdditionalStats />
    </div>
    <Navbar />
    <div class="space-y-5 p-8">
      <section id="Armor" class="scroll-m-32">
        <Armor />
      </section>
      <section id="Weapons" class="scroll-m-32">
        <Weapons />
      </section>
      <section id="Accessories" class="scroll-m-32">
        <Accessories />
      </section>
      <section id="Pets" class="scroll-m-32">
        <Pets />
      </section>
      <section id="Inventory" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <Inventory />
        {/await}
      </section>
      <section id="Skills" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <SkillsSection />
        {/await}
      </section>
      <section id="Dungeons" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <Dungeons />
        {/await}
      </section>
      <section id="Slayer" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <Slayer />
        {/await}
      </section>
      <section id="Minions" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <Minions />
        {/await}
      </section>
      <section id="Bestiary" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <Bestiary />
        {/await}
      </section>
      <section id="Collections" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <Collections />
        {/await}
      </section>
      <section id="Crimson_Isle" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <CrimsonIsle />
        {/await}
      </section>
      <section id="Rift" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <Rift />
        {/await}
      </section>
      <section id="Misc" class="scroll-m-32">
        {#await profile}
          Loading
        {:then}
          <MiscSection />
        {/await}
      </section>
    </div>
  </main>
</div>

<svg xmlns="http://www.w3.org/2000/svg" height="0" width="0" style="position: fixed;">
  <filter id="enchanted-glint">
    <feImage href="/img/enchanted-glint.png" />
    <feComposite in2="SourceGraphic" operator="in" />
    <feBlend in="SourceGraphic" mode="screen" />
  </filter>
</svg>
