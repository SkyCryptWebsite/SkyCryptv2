<script lang="ts">
  import { getEnabledPacks, getPacksContext } from "$ctx";
  import { SettingsTab } from "$lib/components/header/types";
  import type { ModelsResourcePackConfig } from "$lib/shared/api/orval-generated";
  import { Button } from "$ui/button";
  import { ScrollArea } from "$ui/scroll-area";
  import { Switch } from "$ui/switch";
  import * as Tabs from "$ui/tabs";
  import { Feedback } from "@dnd-kit/dom";
  import { SortableKeyboardPlugin } from "@dnd-kit/dom/sortable";
  import { move } from "@dnd-kit/helpers";
  import { DragDropProvider, type DragDropEventHandlers } from "@dnd-kit/svelte";
  import { createSortable } from "@dnd-kit/svelte/sortable";
  import GripVertical from "@lucide/svelte/icons/grip-vertical";
  import PackageOpen from "@lucide/svelte/icons/package-open";
  import { Avatar } from "bits-ui";

  type ResourcePack = ModelsResourcePackConfig & { id: string };
  type SortableItem = ReturnType<typeof createSortable>;
  type DragStartEvent = Parameters<NonNullable<DragDropEventHandlers["onDragStart"]>>[0];
  type DragOverEvent = Parameters<NonNullable<DragDropEventHandlers["onDragOver"]>>[0];
  type DragEndEvent = Parameters<NonNullable<DragDropEventHandlers["onDragEnd"]>>[0];

  const enabledPacks = getEnabledPacks();
  const packsContext = getPacksContext();

  let dragOrder = $state<string[] | null>(null);
  let providerKey = $state(0);

  const packs = $derived(packsContext.packs.filter((pack): pack is ResourcePack => Boolean(pack.id)));
  const packsById = $derived(new Map(packs.map((pack) => [pack.id, pack])));
  const orderedEnabledPackIds = $derived(dragOrder ?? enabledPacks.current);
  const enabledPackConfigs = $derived(
    orderedEnabledPackIds.flatMap((packId) => {
      const pack = packsById.get(packId);
      return pack ? [pack] : [];
    })
  );
  const enabledPackIdSet = $derived(new Set(enabledPacks.current));
  const disabledPackConfigs = $derived(packs.filter((pack) => !enabledPackIdSet.has(pack.id)));

  function onDragStart(_event: DragStartEvent) {
    dragOrder = [...enabledPacks.current];
  }

  function onDragOver(event: DragOverEvent) {
    if (dragOrder === null) return;
    dragOrder = move(dragOrder, event);
  }

  function onDragEnd(event: DragEndEvent) {
    if (!event.canceled && dragOrder !== null) {
      enabledPacks.current = [...dragOrder];
    }
    dragOrder = null;
    providerKey += 1;
  }

  function setPackEnabled(packId: string, enabled: boolean) {
    enabledPacks.current = enabled
      ? [...enabledPacks.current, packId]
      : enabledPacks.current.filter((enabledPackId) => enabledPackId !== packId);
    providerKey += 1;
  }
</script>

<Tabs.Content value={SettingsTab.Packs} class="space-y-4">
  <div class="flex flex-col items-start">
    <div class="flex items-center-safe gap-1">
      <PackageOpen class="size-6 h-lh shrink-0" />
      <h4 class="text-lg font-semibold text-balance">Packs</h4>
    </div>
    <div class="space-y-2 text-pretty text-muted-foreground">
      <p>Resource packs change the textures of items, mobs and other elements in SkyCrypt.</p>
      <p>Enable the packs you want, then drag enabled packs to set their priority.</p>
    </div>
  </div>

  {#if packs.length > 0 && enabledPacks.initialized}
    <ScrollArea class="h-fit" type="always" viewportClasses="max-h-96" scrollbarYClasses="py-2">
      <div class="flex flex-col gap-4 pr-3">
        <section data-slot="enabled-packs" class="space-y-2" aria-labelledby="enabled-packs-heading">
          <h5 id="enabled-packs-heading" class="text-sm font-semibold">Enabled</h5>

          {#if enabledPackConfigs.length > 0}
            <div class="flex flex-col gap-2">
              {#key providerKey}
                <DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
                  {#each enabledPackConfigs as pack, index (pack.id)}
                    {const sortable = createSortable({
                      id: pack.id,
                      get index() {
                        return index;
                      },
                      plugins: [SortableKeyboardPlugin, Feedback.configure({ feedback: "clone" })]
                    })}
                    {@render packRow(pack, true, sortable)}
                  {/each}
                </DragDropProvider>
              {/key}
            </div>
          {:else}
            <div class="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              Vanilla textures only
            </div>
          {/if}
        </section>

        {#if disabledPackConfigs.length > 0}
          <section data-slot="disabled-packs" class="space-y-2" aria-labelledby="disabled-packs-heading">
            <h5 id="disabled-packs-heading" class="text-sm font-semibold text-muted-foreground">Disabled</h5>
            <div class="flex flex-col gap-2">
              {#each disabledPackConfigs as pack (pack.id)}
                {@render packRow(pack, false)}
              {/each}
            </div>
          </section>
        {/if}
      </div>
    </ScrollArea>
  {:else if packs.length === 0}
    <p class="text-center text-sm text-muted-foreground">No packs available.</p>
  {/if}

  {#if enabledPacks.hasChanged}
    <Button class="w-full" onclick={() => window.location.reload()}>Reload to apply changes</Button>
  {/if}
</Tabs.Content>

{#snippet packRow(pack: ResourcePack, enabled: boolean, sortable: SortableItem | null = null)}
  <div
    {@attach sortable?.attach}
    data-slot="resource-pack-row"
    data-pack-id={pack.id}
    data-enabled={enabled}
    data-dragging={sortable?.isDragging}
    data-drop-target={sortable?.isDropTarget}
    class="flex items-center justify-between gap-2 rounded-2xl border p-2 transition-[opacity,transform] duration-150 ease-out data-[dragging=true]:z-10 data-[dragging=true]:opacity-40 data-[dragging=true]:will-change-transform data-[drop-target=true]:border-primary/60">
    <div class="flex min-w-0 items-center gap-2">
      {#if sortable}
        <button
          {@attach sortable.attachHandle}
          type="button"
          class="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-[0.96] active:cursor-grabbing"
          aria-label="Reorder {pack.name ?? pack.id}">
          <GripVertical class="size-4" />
        </button>
      {/if}

      <Avatar.Root class="shrink-0 select-none">
        <Avatar.Image
          loading="lazy"
          src={pack.icon}
          alt={pack.name}
          class="pointer-events-none aspect-square size-10 h-full rounded-lg outline outline-1 -outline-offset-1 outline-black/10 select-none [image-rendering:pixelated] dark:outline-white/10" />
        <Avatar.Fallback class="flex size-10 items-center rounded-lg text-center uppercase"
          >{pack.name?.slice(0, 2)}</Avatar.Fallback>
      </Avatar.Root>

      <div class="flex min-w-0 flex-col">
        <h4 class="flex min-w-0 items-baseline gap-1">
          <Button
            href={pack.url}
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            class="m-0 h-auto min-w-0 justify-start overflow-hidden p-0 text-primary hover:underline">
            <span class="truncate">{pack.name}</span>
          </Button>
          <small class="shrink-0 text-muted-foreground">{pack.version}</small>
        </h4>
        <p class="truncate text-sm text-muted-foreground">by {pack.author}</p>
      </div>
    </div>

    <Switch
      id="resource-pack-{pack.id}"
      checked={enabled}
      aria-label="Enable {pack.name ?? pack.id}"
      onCheckedChange={(checked) => setPackEnabled(pack.id, checked)} />
  </div>
{/snippet}
