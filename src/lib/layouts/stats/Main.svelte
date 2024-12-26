<script lang="ts">
  import { setProfileCtx } from "$ctx/profile.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import AdditionalStats from "$lib/layouts/stats/AdditionalStats.svelte";
  import PlayerProfile from "$lib/layouts/stats/PlayerProfile.svelte";
  import Skills from "$lib/layouts/stats/Skills.svelte";
  import Stats from "$lib/layouts/stats/Stats.svelte";
  import Armor from "$lib/sections/stats/Armor.svelte";
  import type { Stats as StatsType, ValidStats } from "$lib/types/stats";

  let { profile }: { profile: StatsType } = $props();

  $effect.pre(() => {
    setProfileCtx(profile as unknown as ValidStats);
  });
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
        {#if profile.items && profile.items.armor && profile.items.equipment && profile.items.wardrobe}
          <Armor />
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Weapons" class="scroll-m-32">
        {#if profile.items && profile.items.weapons}
          {#await import('$lib/sections/stats/Weapons.svelte') then { default: Weapons }}
            <Weapons />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Accessories" class="scroll-m-32">
        {#if profile.accessories}
          {#await import('$lib/sections/stats/Accessories.svelte') then { default: Accessories }}
            <Accessories />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Pets" class="scroll-m-32">
        {#if profile.pets}
          {#await import('$lib/sections/stats/Pets.svelte') then { default: Pets }}
            <Pets />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Inventory" class="scroll-m-32">
        {#if profile.items}
          {#await import('$lib/sections/stats/Inventory.svelte') then { default: Inventory }}
            <Inventory />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Skills" class="scroll-m-32">
        {#await import('$lib/sections/stats/SkillsSection.svelte') then { default: SkillsSection }}
          <SkillsSection />
        {/await}
      </section>
      <section id="Dungeons" class="scroll-m-32">
        {#if profile.dungeons}
          {#await import('$lib/sections/stats/Dungeons.svelte') then { default: Dungeons }}
            <Dungeons />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Slayer" class="scroll-m-32">
        {#if profile.slayer}
          {#await import('$lib/sections/stats/Slayer.svelte') then { default: Slayer }}
            <Slayer />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Minions" class="scroll-m-32">
        {#if profile.minions}
          {#await import('$lib/sections/stats/Minions.svelte') then { default: Minions }}
            <Minions />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Bestiary" class="scroll-m-32">
        {#if profile.bestiary}
          {#await import('$lib/sections/stats/Bestiary.svelte') then { default: Bestiary }}
            <Bestiary />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Collections" class="scroll-m-32">
        {#if profile.collections}
          {#await import('$lib/sections/stats/Collections.svelte') then { default: Collections }}
            <Collections />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Crimson_Isle" class="scroll-m-32">
        {#if profile.crimson_isle}
          {#await import('$lib/sections/stats/CrimsonIsle.svelte') then { default: CrimsonIsle }}
            <CrimsonIsle />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Rift" class="scroll-m-32">
        {#if profile.rift}
          {#await import('$lib/sections/stats/Rift.svelte') then { default: Rift }}
            <Rift />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
      </section>
      <section id="Misc" class="scroll-m-32">
        {#if profile.misc}
          {#await import('$lib/sections/stats/MiscSection.svelte') then { default: MiscSection }}
            <MiscSection />
          {/await}
        {:else}
          <p>Something went wrong</p>
        {/if}
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
