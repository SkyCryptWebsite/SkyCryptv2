<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import Item from "$lib/components/Item.svelte";
  import SectionTitle from "$lib/components/SectionTitle.svelte";
  import type { ProcessedSkyBlockItem } from "$lib/types/stats";
  import { Avatar, ScrollArea, Tabs } from "bits-ui";
  import Image from "lucide-svelte/icons/image";
  import { cubicInOut } from "svelte/easing";
  import { writable } from "svelte/store";
  import { crossfade, fade } from "svelte/transition";

  const { profile } = getProfileCtx();

  const inventory = $derived(profile.items.inventory.slice(9).concat(profile.items.inventory.slice(0, 9)));
  const backpack = $derived(profile.items.backpack);
  const enderchest = $derived(profile.items.enderchest);
  const vault = $derived(profile.items.personal_vault);
  const accs = $derived(profile.items.talisman_bag);
  const pots = $derived(profile.items.potion_bag);
  const fish = $derived(profile.items.fishing_bag);
  const quiver = $derived(profile.items.quiver);
  const museum = $derived(profile.items.museum);

  const openTab = writable<string>("inv");

  const tabs = $derived(
    [
      {
        id: "inv",
        icon: `https://crafatar.com/renders/head/${profile.uuid}?overlay`,
        items: inventory,
        hr: 27
      },
      {
        id: "storage",
        icon: "/api/item/chest",
        items: backpack,
        hr: 45
      },
      {
        id: "ender",
        icon: "/api/item/ender_chest",
        items: enderchest,
        hr: 45
      },
      {
        id: "vault",
        icon: "/api/head/f7aadff9ddc546fdcec6ed5919cc39dfa8d0c07ff4bc613a19f2e6d7f2593",
        items: vault,
        hr: 45
      },
      {
        id: "accs",
        icon: "/api/head/961a918c0c49ba8d053e522cb91abc74689367b4d8aa06bfc1ba9154730985ff",
        items: accs,
        hr: 45
      },
      {
        id: "pots",
        icon: "/api/head/9f8b82427b260d0a61e6483fc3b2c35a585851e08a9a9df372548b4168cc817c",
        items: pots,
        hr: 45
      },
      {
        id: "fish",
        icon: "/api/head/eb8e297df6b8dffcf135dba84ec792d420ad8ecb458d144288572a84603b1631",
        items: fish,
        hr: 45
      },
      {
        id: "quiver",
        icon: "/api/head/4cb3acdc11ca747bf710e59f4c8e9b3d949fdd364c6869831ca878f0763d1787",
        items: quiver,
        hr: 45
      },
      {
        id: "museum",
        icon: "/api/head/438cf3f8e54afc3b3f91d20a49f324dca1486007fe545399055524c17941f4dc",
        items: museum,
        hr: 54
      }
    ].filter((tab) => tab.items.length > 0)
  );

  const openStorageTab = writable<string>("0");

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut
  });
</script>

<SectionTitle class="pb-4">Inventory</SectionTitle>

<Tabs.Root bind:value={$openTab} class="relative mb-0 rounded-lg bg-background/30 p-5 @container">
  <Tabs.List>
    <ScrollArea.Root>
      <ScrollArea.Viewport class="border-b border-icon">
        <ScrollArea.Content class="!flex h-full shrink-0 flex-nowrap items-center gap-3 whitespace-nowrap px-4">
          {#each tabs as tab}
            {@const isActive = $openTab === tab.id}
            <Tabs.Trigger value={tab.id} class="group relative flex items-center justify-center gap-0.5 pb-2 text-xs uppercase">
              <Avatar.Root class="size-8">
                <Avatar.Image loading="lazy" src={tab.icon} class="size-8 object-contain" />
                <Avatar.Fallback>
                  <Image class="size-8" />
                </Avatar.Fallback>
              </Avatar.Root>
              {tab.id}
              {#if isActive}
                <div class="absolute -bottom-1 h-2 w-full rounded-full bg-icon" in:send={{ key: "active-tab" }} out:receive={{ key: "active-tab" }}></div>
              {:else}
                <div class="absolute -bottom-1 h-2 w-full rounded-full bg-icon opacity-0 transition-opacity duration-300 group-hover:opacity-100" out:fade={{ duration: 300 }}></div>
              {/if}
            </Tabs.Trigger>
          {/each}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  </Tabs.List>

  {#each tabs as tab}
    <Tabs.Content value={tab.id} asChild let:builder>
      {#if $openTab === tab.id}
        {#if tab.id === "storage"}
          <div use:builder.action {...builder}>
            <Tabs.Root bind:value={$openStorageTab}>
              <Tabs.List class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 pt-5 @md:gap-1.5 @xl:gap-2">
                {#each tab.items as item, index}
                  <Tabs.Trigger let:builder asChild value={item.texture_path ? index.toString() : "undefined"}>
                    <div use:builder.action {...builder} class="group">
                      {#if tab.hr === index}
                        <hr class="col-start-1 col-end-10 h-4 border-0" />
                      {/if}
                      {#if item.texture_path}
                        <div class="flex aspect-square items-center justify-center rounded group-data-[state=active]:bg-text/10 group-data-[state=inactive]:bg-text/[0.04]" in:fade|global={{ duration: 300, delay: 5 * (index + 1) }}>
                          <Item piece={item} isInventory={true} showRecombobulated={false} />
                        </div>
                      {:else}
                        <div class="aspect-square rounded bg-text/[0.04]" in:fade|global={{ duration: 300, delay: 5 * (index + 1) }}></div>
                      {/if}
                    </div>
                  </Tabs.Trigger>
                {/each}
              </Tabs.List>
              {#if tab.items[Number($openStorageTab)].containsItems}
                {@const containedItems = tab.items[Number($openStorageTab)].containsItems as ProcessedSkyBlockItem[]}
                <div class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 pt-5 @md:gap-1.5 @xl:gap-2">
                  {#each containedItems as containedItem, index}
                    <Tabs.Content value={$openStorageTab.toString()}>
                      {#key $openStorageTab}
                        {#if containedItem.texture_path}
                          <div class="flex aspect-square items-center justify-center rounded bg-text/[0.04]" in:fade|global={{ duration: 300, delay: 5 * (index + 1) }}>
                            <Item piece={containedItem} isInventory={true} showRecombobulated={false} />
                          </div>
                        {:else}
                          <div class="aspect-square rounded bg-text/[0.04]" in:fade|global={{ duration: 300, delay: 5 * (index + 1) }}></div>
                        {/if}
                      {/key}
                    </Tabs.Content>
                  {/each}
                </div>
              {/if}
            </Tabs.Root>
          </div>
        {:else}
          <div use:builder.action {...builder} class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 pt-5 @md:gap-1.5 @xl:gap-2">
            {#each tab.items as item, index}
              {#if tab.hr === index}
                <hr class="col-start-1 col-end-10 h-4 border-0" />
              {/if}
              {#if item.texture_path}
                <div class="flex aspect-square items-center justify-center rounded bg-text/[0.04]" in:fade|global={{ duration: 300, delay: 5 * (index + 1) }}>
                  {#if tab.id === "inv"}
                    <Item piece={{ ...item, rarity: item.rarity ?? "uncommon" } as ProcessedSkyBlockItem} isInventory={true} showRecombobulated={false} />
                  {:else}
                    <Item piece={item} isInventory={true} showRecombobulated={false} />
                  {/if}
                </div>
              {:else}
                <div class="aspect-square rounded bg-text/[0.04]" in:fade|global={{ duration: 300, delay: 5 * (index + 1) }}></div>
              {/if}
            {/each}
          </div>
        {/if}
      {/if}
    </Tabs.Content>
  {/each}
</Tabs.Root>
