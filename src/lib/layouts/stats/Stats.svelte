<script lang="ts">
  import { getProfileContext } from "$ctx";
  import { Notice } from "$lib/components/notices";
  import { Stat } from "$lib/components/stats";
  import { getPlayerStats } from "$lib/shared/api/skycrypt-api.remote";
  import { buttonVariants } from "$ui/button";
  import { Button } from "$ui/button";
  import * as Collapsible from "$ui/collapsible";
  import { Spinner } from "$ui/spinner";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";

  let openState = $state(false);
  let showAllStats = $state(false);
  const profile = $derived(getProfileContext().current);
  const profileUUID = $derived(profile?.uuid);
  const profileId = $derived(profile?.profile_id);
  const statsQuery = $derived(
    openState && profileUUID && profileId ? getPlayerStats({ uuid: profileUUID, profileId }) : null
  );
</script>

<div class="stats flex flex-col">
  <Collapsible.Root bind:open={openState}>
    {#key profile}
      <Collapsible.Content
        forceMount={true}
        class="columns-[12.5rem] *:motion-preset-focus *:motion-preset-slide-down *:motion-delay-[calc(sibling-index()*0.01s)]">
        {#snippet child({ props, open })}
          {#if open}
            {#if statsQuery?.error}
              <Notice
                title="An unexpected error has occurred"
                type="error"
                error={statsQuery.error instanceof Error ? statsQuery.error.message : String(statsQuery.error)} />
            {/if}
            {#if statsQuery?.current?.stats}
              <div {...props} transition:slide|global={{ duration: 300, easing: cubicOut, axis: "y" }}>
                {#key showAllStats}
                  {#each statsQuery.current.stats as stat, index (index)}
                    {#if stat.statsInfo && (showAllStats || stat.statsInfo.total > 0)}
                      <Stat data={stat} />
                    {/if}
                  {/each}
                {/key}
              </div>
            {/if}
          {/if}
        {/snippet}
      </Collapsible.Content>
    {/key}
    <div class="flex w-full items-center-safe justify-center-safe gap-2">
      {#key openState}
        <Collapsible.Trigger
          class={buttonVariants({
            variant: "outline",
            class: "flex-1 motion-preset-focus bg-foreground/5 font-semibold hover:bg-muted/5 data-[state=open]:mt-3.5"
          })}>
          {#if statsQuery?.loading}
            <Spinner />
          {:else}
            {openState ? "Hide Stats" : "Show Stats"}
          {/if}
        </Collapsible.Trigger>
      {/key}
      {#if openState}
        <Button
          variant="outline"
          class="mt-3.5 flex-1 motion-preset-focus bg-foreground/5 font-semibold hover:bg-muted/5"
          onclick={() => (showAllStats = !showAllStats)}>
          {showAllStats ? "Hide Stats With Zero Values" : "Show All Stats"}
        </Button>
      {/if}
    </div>
  </Collapsible.Root>
</div>
