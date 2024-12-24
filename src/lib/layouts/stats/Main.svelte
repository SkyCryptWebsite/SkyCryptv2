<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import AdditionalStats from "$lib/layouts/stats/AdditionalStats.svelte";
  import PlayerProfile from "$lib/layouts/stats/PlayerProfile.svelte";
  import Skills from "$lib/layouts/stats/Skills.svelte";
  import Stats from "$lib/layouts/stats/Stats.svelte";
  import Armor from "$lib/sections/stats/Armor.svelte";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { setContext } from "svelte";

  let { profile }: { profile: StatsType } = $props();

  setContext<StatsType>("profile", profile);
</script>

<div class="relative @container/parent">
  <div class="fixed left-0 top-1/2 z-10 hidden h-dvh w-[30vw] -translate-y-1/2 @container min-[1200px]:block">
    {#await import('$lib/components/Skin3D.svelte') then { default: Skin3D }}
      <Skin3D class="h-full" />
    {/await}
  </div>

  <div class="fixed right-0 top-0 h-dvh w-full backdrop-blur-lg backdrop-brightness-50 @[75rem]/parent:w-[calc(100%-30vw)]"></div>
  <main class="relative mx-auto @container @[75rem]/parent:ml-[30vw]">
    <div class="space-y-5 p-4 @[75rem]/parent:p-8">
      <PlayerProfile />
      <Skills />
      <Stats />
      <AdditionalStats />
    </div>

    <Navbar />

    <div class="space-y-5 p-4 @[75rem]/parent:p-8">
      <section id="Armor" class="scroll-m-32">
        <Armor />
      </section>
      <section id="Weapons" class="scroll-m-32">
        {#await import('$lib/sections/stats/Weapons.svelte') then { default: Weapons }}
          <Weapons />
        {/await}
      </section>
      <section id="Accessories" class="scroll-m-32">
        {#await import('$lib/sections/stats/Accessories.svelte') then { default: Accessories }}
          <Accessories />
        {/await}
      </section>
      <section id="Pets" class="scroll-m-32">
        {#await import('$lib/sections/stats/Pets.svelte') then { default: Pets }}
          <Pets />
        {/await}
      </section>
      <section id="Inventory" class="scroll-m-32">
        {#await import('$lib/sections/stats/Inventory.svelte') then { default: Inventory }}
          <Inventory />
        {/await}
      </section>
      <section id="Skills" class="scroll-m-32">
        {#await import('$lib/sections/stats/SkillsSection.svelte') then { default: SkillsSection }}
          <SkillsSection />
        {/await}
      </section>
      <section id="Dungeons" class="scroll-m-32">
        {#await import('$lib/sections/stats/Dungeons.svelte') then { default: Dungeons }}
          <Dungeons />
        {/await}
      </section>
      <section id="Slayer" class="scroll-m-32">
        {#await import('$lib/sections/stats/Slayer.svelte') then { default: Slayer }}
          <Slayer />
        {/await}
      </section>
      <section id="Minions" class="scroll-m-32">
        {#await import('$lib/sections/stats/Minions.svelte') then { default: Minions }}
          <Minions />
        {/await}
      </section>
      <section id="Bestiary" class="scroll-m-32">
        {#await import('$lib/sections/stats/Bestiary.svelte') then { default: Bestiary }}
          <Bestiary />
        {/await}
      </section>
      <section id="Collections" class="scroll-m-32">
        {#await import('$lib/sections/stats/Collections.svelte') then { default: Collections }}
          <Collections />
        {/await}
      </section>
      <section id="Crimson_Isle" class="scroll-m-32">
        {#await import('$lib/sections/stats/CrimsonIsle.svelte') then { default: CrimsonIsle }}
          <CrimsonIsle />
        {/await}
      </section>
      <section id="Rift" class="scroll-m-32">
        {#await import('$lib/sections/stats/Rift.svelte') then { default: Rift }}
          <Rift />
        {/await}
      </section>
      <section id="Misc" class="scroll-m-32">
        {#await import('$lib/sections/stats/MiscSection.svelte') then { default: MiscSection }}
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
