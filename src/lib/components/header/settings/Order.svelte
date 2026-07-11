<script lang="ts">
  import { getPreferences } from "$ctx";
  import { SettingsTab } from "$lib/components/header/types";
  import { sections } from "$lib/sections/constants";
  import { Button } from "$ui/button";
  import { ScrollArea } from "$ui/scroll-area";
  import * as Tabs from "$ui/tabs";
  import { Feedback } from "@dnd-kit/dom";
  import { OptimisticSortingPlugin, SortableKeyboardPlugin } from "@dnd-kit/dom/sortable";
  import { move } from "@dnd-kit/helpers";
  import { DragDropProvider, type DragDropEventHandlers } from "@dnd-kit/svelte";
  import { createSortable } from "@dnd-kit/svelte/sortable";
  import GripVertical from "@lucide/svelte/icons/grip-vertical";
  import ListOrdered from "@lucide/svelte/icons/list-ordered";

  const preferences = getPreferences();
  type SectionItem = (typeof preferences.sectionOrder)[number];
  type SortableItem = ReturnType<typeof createSortable>;

  const defaultSectionOrder = sections;
  const differsFromDefault = $derived(JSON.stringify(preferences.sectionOrder) !== JSON.stringify(defaultSectionOrder));

  let sectionOrder = $state([...preferences.sectionOrder]);
  let providerKey = $state(0);

  function onDragEnd(event: Parameters<NonNullable<DragDropEventHandlers["onDragEnd"]>>[0]) {
    sectionOrder = move(sectionOrder, event);
    preferences.sectionOrder = [...sectionOrder];
    providerKey += 1;
  }
</script>

<Tabs.Content value={SettingsTab.Order} class="space-y-4">
  <div class="flex flex-col items-start">
    <div class="flex items-center-safe gap-1">
      <ListOrdered class="size-6 h-lh shrink-0" />
      <h4 class="text-lg font-semibold">Order</h4>
    </div>
    <div>
      <div class="space-y-2 text-muted-foreground">
        <p>Drag and drop the sections to reorder them as you like.</p>
      </div>
    </div>
  </div>
  <ScrollArea class="h-fit" type="always" viewportClasses="max-h-96" scrollbarYClasses="py-2">
    <div class="flex flex-col gap-4 pr-3">
      {#key providerKey}
        <DragDropProvider {onDragEnd}>
          {#each sectionOrder as section, index (section.id)}
            {const sortable = createSortable({
              id: section.id,
              get index() {
                return index;
              },
              plugins: [SortableKeyboardPlugin, OptimisticSortingPlugin, Feedback.configure({ feedback: "clone" })]
            })}
            {@render sectionRowContent(section, sortable, true)}
          {/each}
        </DragDropProvider>
      {/key}
    </div>
  </ScrollArea>
  {#if differsFromDefault}
    <Button
      variant="destructive"
      class="w-full"
      onclick={() => {
        sectionOrder = [...defaultSectionOrder];
        preferences.sectionOrder = [...defaultSectionOrder];
        providerKey += 1;
      }}>
      Reset to default
    </Button>
  {/if}
</Tabs.Content>

{#snippet sectionRowContent(section: SectionItem, sortable: SortableItem | null = null, flipEnabled = false)}
  <div {@attach sortable?.attach} class="relative flex items-center gap-2 rounded-xl p-2 border font-semibold data-[dragging=true]:animate-pulse data-[dragging=true]:opacity-30 data-[flip=true]:will-change-transform" data-dragging={sortable?.isDropTarget} data-flip={flipEnabled}>
    <GripVertical class="size-4 shrink-0 text-muted-foreground" />
    {section.name.replaceAll("_", " ")}
  </div>
{/snippet}
