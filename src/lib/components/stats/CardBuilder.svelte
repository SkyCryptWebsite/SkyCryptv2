<script lang="ts">
  import { getHoverContext } from "$ctx";
  import { Button } from "$ui/button";
  import * as Drawer from "$ui/drawer";
  import { Spinner } from "$ui/spinner";
  import IdCardIcon from "@lucide/svelte/icons/id-card";
  import * as Dialog from "#lib/components/ui/dialog";

  type TriggerProps = Record<string, unknown>;
  const isHover = getHoverContext();

  // The builder pulls in the card presets and components, so load it only once the dialog opens.
  const loadContent = () => import("./CardBuilderContent.svelte");
</script>

{#snippet triggerButton(props: TriggerProps)}
  <Button {...props} class="text-base font-semibold">
    <IdCardIcon class="size-4" />
    Card
  </Button>
{/snippet}

{#snippet content(className?: string)}
  {#await loadContent()}
    <div class="flex justify-center py-8"><Spinner /></div>
  {:then { default: CardBuilderContent }}
    <CardBuilderContent class={className} />
  {/await}
{/snippet}

{#if isHover.current}
  <Dialog.Root>
    <Dialog.Trigger>
      {#snippet child({ props })}
        {@render triggerButton(props)}
      {/snippet}
    </Dialog.Trigger>
    <Dialog.Content
      class="max-h-[calc(96%-3rem)]! overflow-x-clip overflow-y-scroll glass glass-bg-popover sm:max-w-2xl standard:bg-transparent"
      showCloseButton={false}>
      <Dialog.Header>
        <Dialog.Title>Generate your SkyCrypt card</Dialog.Title>
        <Dialog.Description
          >Choose from various presets and options to create the perfect card for sharing on social media, forums, or
          with friends!</Dialog.Description>
      </Dialog.Header>
      {@render content()}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root shouldScaleBackground={true} setBackgroundColorOnScale={false}>
    <Drawer.Trigger>
      {#snippet child({ props })}
        {@render triggerButton(props)}
      {/snippet}
    </Drawer.Trigger>
    <Drawer.Content class="px-6 py-4 before:bg-background/80">
      {@render content("mt-4 overflow-y-scroll")}
    </Drawer.Content>
  </Drawer.Root>
{/if}
