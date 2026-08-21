<script lang="ts">
  import { genericTooltipTether, getInternalState } from "$ctx";
  import type { ModelsPlayerStat } from "$lib/shared/api/orval-generated";
  import { cn } from "$lib/shared/utils";
  import * as Item from "$ui/item";
  import { Label } from "$ui/label";
  import { Separator } from "$ui/separator";
  import * as Tooltip from "$ui/tooltip";
  import { format } from "numerable";

  type Props = {
    data: ModelsPlayerStat;
    class?: string | null | undefined;
  };

  let { data, class: className = undefined }: Props = $props();

  let open = $state(false);
  let iconRef = $state<HTMLElement | null>(null);

  const internalState = getInternalState();
  const statIconClass = "grid size-4 shrink-0 place-items-center font-skyblock-icons text-base leading-none";
</script>

<Tooltip.Trigger
  class={cn("flex-nowrap gap-2 p-0", `text-minecraft-${data.color}`, className)}
  onpointerdown={() => (open = !open)}
  onclick={() => (internalState.content = tooltipContent)}
  tether={genericTooltipTether}
  payload={{
    class:
      "z-50 space-y-2 rounded-xl border glass bg-transparent p-4 text-sm glass-bg-popover performance:bg-popover [&>div]:leading-7 [&>span]:invisible",
    side: "top",
    sideOffset: 4,
    align: "center",
    customAnchor: iconRef,
    children: tooltipContent
  }}>
  {#snippet child({ props })}
    <Item.Root {...props}>
      <Item.Media variant="icon" class="size-4">
        <span bind:this={iconRef} class={statIconClass}>{data.symbol}</span>
      </Item.Media>
      <Item.Content>
        <Item.Title class="text-sm font-bold whitespace-nowrap">
          <span class="capitalize">{data.name?.replace(/_/g, " ")}</span>
          <span class="text-foreground">
            {format(data.statsInfo?.total ?? 0)}{#if data.statsInfo?.percent}%{/if}
          </span>
        </Item.Title>
      </Item.Content>
    </Item.Root>
  {/snippet}
</Tooltip.Trigger>

{#snippet tooltipContent()}
  <div
    class={cn(
      "flex w-fit items-center-safe gap-2 pb-1 text-base font-bold whitespace-nowrap",
      `text-minecraft-${data.color}`
    )}>
    <span class={statIconClass}>{data.symbol}</span>
    <span class="capitalize">{data.name?.replace(/_/g, " ")}</span>
  </div>

  <Label class="font-bold capitalize text-minecraft-{data.color}"
    >Base {data.name?.replace(/_/g, " ")}:
    <span class="text-foreground">{format(data.statsInfo?.base ?? 0)}</span></Label>
  <p>Base value every player has at the beginning of their SkyBlock adventure!</p>

  {#if data.statsInfo?.total}
    <Separator />

    <Label class="font-bold capitalize text-minecraft-{data.color}"
      >Bonus {data.name?.replace(/_/g, " ")}:
      <span class="text-foreground">{format(data.statsInfo?.total)}</span></Label>
    <p>Bonus value obtained from:</p>

    <ul class="flex list-inside list-disc flex-col">
      {#each Object.entries(data.statsInfo) as [key, value], index (index)}
        {#if !["total", "base"].includes(key)}
          <li class="relative capitalize">
            <span class="absolute inset-0 left-3">
              {key.replaceAll("_", " ")}
              <span class="font-bold">+{format(value)}</span>
            </span>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
{/snippet}
