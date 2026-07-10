<script lang="ts">
  import { getSkillsContext } from "$ctx";
  import { Chip, SearchTabs } from "$lib/components/misc";
  import { AdditionStat } from "$lib/components/stats";
  import type { ModelsAttributeShard } from "$lib/shared/api/orval-generated";
  import { RARITIES } from "$lib/shared/constants/rarities";
  import { getRarityClass, renderLore, titleCase } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import { tz } from "@date-fns/tz";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import { formatDate } from "date-fns";
  import { format } from "numerable";

  const skills = $derived(getSkillsContext().skills);
  const hunting = $derived(skills?.hunting);
  const allShards = $derived(hunting?.shards ?? []);

  const normalize = (value?: string | null) => value?.trim().toLocaleLowerCase() ?? "";
  const getFamilyText = (shard?: ModelsAttributeShard) => shard?.family?.filter(Boolean).join(", ") ?? "";
  const getShardRarity = (shard?: ModelsAttributeShard) => normalize(shard?.rarity) || "common";
  const isMaxed = (shard?: ModelsAttributeShard) => (shard?.maxSyphon ?? 0) > 0 && (shard?.syphoned ?? 0) >= (shard?.maxSyphon ?? 0);
  const hasProgress = (shard?: ModelsAttributeShard) => (shard?.owned ?? 0) > 0 || (shard?.syphoned ?? 0) > 0 || shard?.capturedTimestamp != null;

  const summary = $derived.by(() => {
    const shards = allShards;

    return {
      totalListed: shards.length,
      maxed: shards.filter((shard) => isMaxed(shard)).length,
      unlocked: hunting?.unlocked ?? 0,
      maxUnlocked: hunting?.maxUnlocked,
      syphoned: hunting?.syphoned ?? 0,
      maxSyphoned: hunting?.maxSyphoned
    };
  });

  const sortedShards = $derived.by(() =>
    allShards
      .map((shard, index) => ({ shard, index }))
      .sort((a, b) => {
        const bucketA = isMaxed(a.shard) ? 0 : hasProgress(a.shard) ? 1 : 2;
        const bucketB = isMaxed(b.shard) ? 0 : hasProgress(b.shard) ? 1 : 2;

        if (bucketA !== bucketB) return bucketA - bucketB;

        const syphonDiff = (b.shard.syphoned ?? 0) - (a.shard.syphoned ?? 0);
        if (syphonDiff !== 0) return syphonDiff;

        const nameCompare = (a.shard.name ?? "").localeCompare(b.shard.name ?? "");
        if (nameCompare !== 0) return nameCompare;

        return a.index - b.index;
      })
      .map(({ shard }) => shard)
  );

  const shardTabs = $derived.by(() => {
    const presentRarities = new Set(allShards.map((shard) => getShardRarity(shard)));
    const orderedRarities = RARITIES.filter((rarity) => presentRarities.has(rarity));
    const extraRarities = [...presentRarities].filter((rarity) => !RARITIES.includes(rarity)).sort((a, b) => a.localeCompare(b));

    return [...orderedRarities, ...extraRarities].map((rarity) => ({
      value: rarity,
      label: titleCase(rarity),
      items: sortedShards.filter((shard) => getShardRarity(shard) === rarity),
      triggerClass: getRarityClass(rarity, "text", true),
      activeClass: getRarityClass(rarity, "bg", true)
    }));
  });
</script>

{#if hunting}
  <div class="contents space-y-4">
    <div class="border p-4 rounded-xl">
      <div class="space-y-0.5">
        <AdditionStat text="Unlocked" data={`${summary.unlocked} / ${summary.maxUnlocked ?? "?"}`} maxed={summary.maxUnlocked != null && summary.unlocked >= summary.maxUnlocked} />
        <AdditionStat text="Syphoned" data={`${summary.syphoned} / ${summary.maxSyphoned ?? "?"}`} maxed={summary.maxSyphoned != null && summary.syphoned >= summary.maxSyphoned} />
        <AdditionStat text="Maxed Shards" data={summary.maxed} />
        <AdditionStat text="Shards Listed" data={summary.totalListed} />
      </div>
    </div>

    {#if hunting.shards}
      <SearchTabs tabs={shardTabs} placeholder="Search shards, abilities, or families" searchKeys={(shard) => [shard.name, shard.abilityName, getFamilyText(shard)]} itemKey={(shard, index) => shard.shardId ?? `${shard.name}-${index}`} emptyTitle="No items found" noResultsLabel="No shards match your search.">
        {#snippet item(shard)}
          {const hasMaxed = isMaxed(shard)}
          {const familyText = getFamilyText(shard)}
          {const rarityClass = getRarityClass(getShardRarity(shard), "text")}
          <Chip image={{ src: shard.texture ?? "" }} class="w-fit max-w-full">
            <div class="flex min-w-0 flex-col">
              <div class="font-bold">
                <div class={cn("truncate", rarityClass, hasMaxed && "text-accent-2")}>{shard.name}</div>
                <div class="mt-1 space-y-0.5 text-sm wrap-break-word whitespace-normal">
                  <div class={hasMaxed ? "text-accent-4" : undefined}>
                    <span class="opacity-60">Syphoned:</span>
                    <span>{format(shard.syphoned ?? 0)} / {format(shard.maxSyphon ?? 0)}</span>
                  </div>
                  <div>
                    <span class="opacity-60">Owned:</span>
                    <span>{format(shard.owned ?? 0)}</span>
                  </div>
                  {#if shard.abilityName}
                    <div>
                      <span class="opacity-60">Ability:</span>
                      <span>{shard.abilityName}</span>
                      {#if shard.abilityLevel != null || shard.abilityMaxLevel != null}
                        <span class="opacity-60"> ({shard.abilityLevel ?? 0}/{shard.abilityMaxLevel ?? 0})</span>
                      {/if}
                    </div>
                  {/if}
                  {#if familyText}
                    <div>
                      <span class="opacity-60">Family:</span>
                      <span>{familyText}</span>
                    </div>
                  {/if}
                  {#if shard.capturedTimestamp}
                    <div>
                      <span class="opacity-60">Captured:</span>
                      <span>{formatDate(shard.capturedTimestamp, "dd MMMM yyyy 'at' HH:mm", { in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            {#snippet tooltip()}
              <div class="font-skyblock-icons leading-snug font-semibold">
                {#each shard.lore ?? [] as lore, loreIndex (loreIndex)}
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html renderLore(lore, true, loreIndex)}
                {/each}
              </div>
            {/snippet}
          </Chip>
        {/snippet}
      </SearchTabs>
    {/if}
  </div>
{:else}
  <EmptyStat title="No Data" description="This player doesn't have anything related to hunting" icon={CrosshairIcon} />
{/if}
