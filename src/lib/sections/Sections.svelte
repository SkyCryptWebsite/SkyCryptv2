<script lang="ts" module>
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Module-scoped promise cache is deliberately non-reactive.
  const componentPromises = new Map<string, Promise<unknown>>();

  function loadSection<T>(sectionName: string, loader: () => Promise<T>) {
    const cached = componentPromises.get(sectionName) as Promise<T> | undefined;
    if (cached) return cached;

    const promise = loader();
    componentPromises.set(sectionName, promise);
    void promise.catch(() => {
      if (componentPromises.get(sectionName) === promise) {
        componentPromises.delete(sectionName);
      }
    });

    return promise;
  }
</script>

<script lang="ts">
  import { getCombinedContext, getInternalState, getPreferences } from "$ctx";
  import { Notice } from "$lib/components/notices";
  import type { SectionName } from "$lib/sections/types";
  import { titleCase } from "$lib/shared/helper";
  import { Spinner } from "$ui/spinner";

  const preferences = getPreferences();
  const internalState = getInternalState();
  const combinedCtx = getCombinedContext();

  const COMPONENTS = {
    Gear: () => import("$lib/sections/stats/Gear.svelte"),
    Accessories: () => import("$lib/sections/stats/Accessories.svelte"),
    Pets: () => import("$lib/sections/stats/Pets.svelte"),
    Inventory: () => import("$lib/sections/stats/Inventory.svelte"),
    Skills: () => import("$lib/sections/stats/SkillsSection.svelte"),
    Dungeons: () => import("$lib/sections/stats/Dungeons.svelte"),
    Slayer: () => import("$lib/sections/stats/Slayer.svelte"),
    Minions: () => import("$lib/sections/stats/Minions.svelte"),
    Bestiary: () => import("$lib/sections/stats/Bestiary.svelte"),
    Collections: () => import("$lib/sections/stats/Collections.svelte"),
    Crimson_Isle: () => import("$lib/sections/stats/CrimsonIsle.svelte"),
    Rift: () => import("$lib/sections/stats/Rift.svelte"),
    Misc: () => import("$lib/sections/stats/MiscSection.svelte")
  } satisfies Record<SectionName, () => Promise<{ default: unknown }>>;
  const componentPromise = $derived(loadSection(internalState.tabValue, COMPONENTS[internalState.tabValue]));

  function findIndex(id: SectionName) {
    return preferences.sectionOrder.findIndex((section) => section.name === id);
  }
</script>

{#key internalState.tabValue}
  {const sectionName = internalState.tabValue}
  {#if sectionName in COMPONENTS}
    <svelte:boundary>
      {#snippet pending()}
        {@render loadingState(sectionName)}
      {/snippet}
      {#snippet failed(err, reset)}
        {@render sectionError(sectionName, err, reset)}
      {/snippet}

      <div class="section mt-4" data-section={sectionName} role="tabpanel">
        {#if sectionName !== "Inventory" && !combinedCtx.current}
          {@render loadingState(sectionName)}
        {:else}
          <svelte:boundary>
            {const { default: Component } = await componentPromise}
            <Component order={findIndex(sectionName)} />

            {#snippet pending()}
              {@render loadingState(sectionName)}
            {/snippet}

            {#snippet failed(err, reset)}
              {@render sectionError(sectionName, err, reset)}
            {/snippet}
          </svelte:boundary>
        {/if}
      </div>
    </svelte:boundary>
  {:else}
    <Notice type="error" title={`Invalid Section: ${sectionName}`}>
      <p class="text-foreground/80">This section does not exist or is not implemented.</p>
    </Notice>
  {/if}
{/key}

{#snippet loadingState(sectionName: SectionName)}
  <div class="rounded-xl border p-6">
    <div class="flex items-center gap-2">
      <Spinner />
      <span class="font-semibold">Loading {titleCase(sectionName)}</span>
    </div>
  </div>
{/snippet}

{#snippet sectionError(sectionName: SectionName, err: unknown, retry: () => void)}
  <Notice
    type="error"
    title={`Failed to load section ${sectionName}`}
    error={err instanceof Error ? err.message : String(err)}
    {retry}>
    <p class="text-foreground/80">This section may not be available or there was an error loading it.</p>
  </Notice>
{/snippet}
