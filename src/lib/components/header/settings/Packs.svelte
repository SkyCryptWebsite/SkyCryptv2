<script lang="ts">
  import { getDisabledPacks, getPacksContext } from "$ctx";
  import { SettingsTab } from "$lib/components/header/types";
  import { Button } from "$ui/button";
  import { Label } from "$ui/label";
  import { ScrollArea } from "$ui/scroll-area";
  import { Switch } from "$ui/switch";
  import * as Tabs from "$ui/tabs";
  import PackageOpen from "@lucide/svelte/icons/package-open";
  import { Avatar } from "bits-ui";

  const disabledPacks = getDisabledPacks();
  const initialPackConfig = disabledPacks.current;
  const hasPackConfigChanged = $derived(JSON.stringify(disabledPacks.current.toSorted()) !== JSON.stringify(initialPackConfig.toSorted()));
  const packsContext = $derived(getPacksContext());
  const packs = $derived(packsContext.packs);
</script>

<Tabs.Content value={SettingsTab.Packs} class="space-y-4">
  <div class="flex flex-col items-start">
    <div class="flex items-center-safe gap-1">
      <PackageOpen class="size-6 h-lh shrink-0" />
      <h4 class="text-lg font-semibold">Packs</h4>
    </div>
    <div>
      <div class="space-y-2 text-muted-foreground">
        <p>Resource packs change the textures of items, mobs and other elements in SkyCrypt.</p>
        <p>You can enable or disable as many packs as you want, but their preference order can't be changed.</p>
      </div>
    </div>
  </div>
  {#if packs.length > 0}
    <ScrollArea class="h-fit" type="always" viewportClasses="max-h-96" scrollbarYClasses="py-2">
      <div class="flex flex-col gap-4 pr-3">
        {#each packs as pack (pack.id)}
          <Label for={pack.id} class="flex items-center justify-between gap-4 rounded-xl border p-2">
            <div class="flex items-center gap-2">
              <Avatar.Root class="shrink-0 select-none">
                <Avatar.Image loading="lazy" src={pack.icon} alt={pack.name} class="pointer-events-none aspect-square size-10 h-full rounded-xl select-none [image-rendering:pixelated]" />
                <Avatar.Fallback class="flex items-center rounded-xl text-center uppercase">{pack.name?.slice(0, 2)}</Avatar.Fallback>
              </Avatar.Root>
              <div class="flex flex-col">
                <h4>
                  <Button href={pack.url} variant="link" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline p-0 m-0 h-auto">{pack.name}</Button>
                  <small>{pack.version}</small>
                </h4>
                <p class="overflow-hidden font-normal text-ellipsis whitespace-nowrap text-muted-foreground">
                  by
                  {pack.author}
                </p>
              </div>
            </div>
            {#if pack.id}
              <Switch id={pack.id} checked={!disabledPacks.current.includes(pack.id)} onCheckedChange={() => (disabledPacks.current = !disabledPacks.current.includes(pack.id ?? "") ? [...new Set([...disabledPacks.current, pack.id ?? ""])] : disabledPacks.current.filter((id) => id !== (pack.id ?? "")))} />
            {/if}
          </Label>
        {/each}
      </div>
    </ScrollArea>
  {:else}
    <p class="text-center text-sm text-muted-foreground">No packs available.</p>
  {/if}
  {#if hasPackConfigChanged}
    <Button
      class="w-full"
      onclick={() => {
        window.location.reload();
      }}>
      Reload to apply changes
    </Button>
  {/if}
</Tabs.Content>
