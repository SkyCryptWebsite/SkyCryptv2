<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.races != null}
  <div class="space-y-4">
    <SectionSubtitle class="!uppercase">Races</SectionSubtitle>
    <div class="flex flex-wrap gap-4">
      {#each Object.entries(misc.races) as [_, race]}
        <div class="flex min-w-64 flex-col gap-1 rounded-lg bg-background/30">
          <div class="flex w-full items-center justify-center gap-1.5 border-b-2 border-icon py-2 text-center font-semibold uppercase">{race.name}</div>
          <div class="my-2.5 space-y-2.5 px-5">
            {#if race.races.with_return}
              <p class="font-bold text-text/80">With Return:</p>
              <div>
                <div class="flex h-full w-full flex-col flex-wrap gap-1">
                  {#each Object.entries(race.races.with_return) as [_, value]}
                    <AdditionStat class="text-base" text={value.name} data={format(value.time)} />
                  {/each}
                </div>
              </div>
            {/if}

            {#if race.races.no_return}
              <p class="font-bold text-text/80">No Return:</p>
              <div>
                <div class="flex h-full w-full flex-col flex-wrap gap-1">
                  {#each Object.entries(race.races.no_return) as [_, value]}
                    <AdditionStat class="text-base" text={value.name} data={format(value.time)} />
                  {/each}
                </div>
              </div>
            {/if}

            {#if race.name === "Other"}
              <div class="flex h-full w-full flex-col flex-wrap gap-1">
                {#each Object.entries(race.races) as [_, value]}
                  {#if value && "name" in value}
                    <AdditionStat class="text-base" text={value.name} data={format(value.time)} />
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
