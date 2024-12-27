<script lang="ts">
  import type { IsHover } from "$lib/hooks/is-hover.svelte";
  import type { Theme } from "$lib/shared/constants/themes";
  import themes from "$lib/shared/constants/themes";
  import { flyAndScale } from "$lib/shared/utils";
  import { disabledPacks } from "$lib/stores/packs";
  import { theme as themeStore } from "$lib/stores/themes";
  import { Button, Popover } from "bits-ui";
  import Info from "lucide-svelte/icons/info";
  import { getContext, onMount } from "svelte";
  import { derived, get } from "svelte/store";
  import { Drawer } from "vaul-svelte";

  let settingsOpen = $state(false);

  const isHover = getContext<IsHover>("isHover");

  const initialPackConfig = get(disabledPacks);
  const hasPackConfigChanged = derived(disabledPacks, ($disabledPacks) => {
    return JSON.stringify($disabledPacks.sort()) !== JSON.stringify(initialPackConfig.sort());
  });

  function changeTheme(themeId: Theme["id"]) {
    const theme = themes.find((theme) => theme.id === themeId);
    if (!theme) {
      themeStore.set("default");
      document.documentElement.dataset.theme = "default";
      document.cookie = `theme=default; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
      return;
    }
    if (theme.light) {
      document.documentElement.dataset.mode = "light";
    } else {
      document.documentElement.dataset.mode = "dark";
    }

    document.documentElement.dataset.theme = theme.id;
    document.cookie = `theme=${theme.id}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
  }

  onMount(() => {
    changeTheme($themeStore);
  });
</script>

{#snippet info()}
  <p class="my-4">SkyCrypt is a free open-source stats viewer for Hypixel SkyBlock.</p>
  <p class="my-4">
    You can report bugs, suggest features, or contribute to the code on <Button.Root class="font-semibold text-link" href="https://github.com/SkyCryptWebsite/SkyCrypt" target="_blank" rel="noreferrer">GitHub</Button.Root>. It would be much appreciated!
  </p>
  <p class="my-4">
    Join our community on <Button.Root class="font-semibold text-link" href="https://discord.gg/cNgADv2kEQ" target="_blank" rel="noreferrer">Discord!</Button.Root>
  </p>
  <p class="my-4">
    Help keep SkyCrypt ad free by donating on <Button.Root class="font-semibold text-link" href="https://www.patreon.com/shiiyu" target="_blank" rel="noreferrer">Patreon!</Button.Root>
  </p>
  <p class="my-4">
    The original project, <Button.Root class="font-semibold text-link" href="https://sky.lea.moe">sky.lea.moe</Button.Root>, was orginally created by
    <Button.Root class="font-semibold text-link" href="https://twitter.com/LeaPhant" target="_blank" rel="noreferrer">LeaPhant</Button.Root>. Thanks for all of what you've done Lea!
  </p>
  <h4 class="mb-4 mt-5 font-bold">Used Resources:</h4>
  <ul class="list-inside list-disc [&_ul]:mb-2 [&_ul]:list-inside [&_ul]:list-[revert] [&_ul]:pl-5">
    <li>
      Custom Textures:
      <ul>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/4101579" target="_blank">FurfSky Reborn</Button.Root>
          by <span class="text-text/70">The Reborn Team</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/3470904" target="_blank">RNBW+</Button.Root>
          by <span class="text-text/70">rainbowcraft2</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/2103515" target="_blank">Hypixel Skyblock Pack</Button.Root>
          by <span class="text-text/70">Packs HQ</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/4174260" target="_blank">Hypixel Plus</Button.Root>
          by <span class="text-text/70">ic22487</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/2147652" target="_blank">Vanilla+</Button.Root>
          by <span class="text-text/70">TBlazeWarriorT</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/3597207" target="_blank">Worlds and Beyond</Button.Root>
          by <span class="text-text/70">Skeletony_</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://www.minecraft.net/" target="_blank">Default Minecraft Textures</Button.Root>
          by <span class="text-text/70">Mojang</span>
        </li>
      </ul>
    </li>
    <li>
      Background Image:
      <ul>
        <li>
          Resource Pack: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://www.planetminecraft.com/texture_pack/16x132-dandelion-cute-and-swirly/" target="_blank">Dandelion</Button.Root>
          by <span class="text-text/70">Steelfeathers</span>
        </li>
        <li>
          Shaders: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://sildurs-shaders.github.io/" target="_blank">Sildur's Vibrant Shaders</Button.Root>
          by <span class="text-text/70">Sildur</span>
        </li>
        <li>
          April Fools 2024: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://wall.alphacoders.com/big.php?i=684569" target="_blank">Wallpaper</Button.Root>
          by <span class="text-text/70">Tinkerbell</span>
        </li>
      </ul>
    </li>
    <li>
      Libraries:
      <ul>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://twemoji.twitter.com/" target="_blank">Twemoji</Button.Root>
          by
          <span class="text-text/70">Twitter</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://github.com/bs-community/skinview3d/" target="_blank">skinview3d</Button.Root>
          by <span class="text-text/70">Blessing Skin</span>
        </li>
      </ul>
    </li>
    <li>
      Weight Calculations:
      <ul>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://github.com/Senither/hypixel-skyblock-facade" target="_blank">Hypixel SkyBlock Facade</Button.Root>
          by <span class="text-text/70">Senither</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://github.com/Antonio32A/lilyweight" target="_blank">lilyweight</Button.Root>
          by <span class="text-text/70">LappySheep</span> and <span class="text-text/70">Antonio32A</span>
        </li>
        <li>
          <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://elitebot.dev/" target="_blank">Farming Weight</Button.Root>
          by
          <span class="text-text/70">Elite</span>
        </li>
      </ul>
    </li>
    <li>
      Networth: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://www.npmjs.com/package/skyhelper-networth" target="_blank">SkyHelper Networth</Button.Root>
      by <span class="text-text/70">SkyHelper</span>
    </li>
    <li>
      Player Heads: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/forums/skyblock.157/" target="_blank">SkyBlock</Button.Root>
      by <span class="text-text/70">Hypixel</span>
    </li>
    <li>
      Data: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://api.hypixel.net/" target="_blank">Hypixel API</Button.Root>
      by <span class="text-text/70">Hypixel</span>
    </li>
  </ul>
{/snippet}

{#if isHover.current}
  <Popover.Root>
    <Popover.Trigger class="relative my-3 flex shrink items-center justify-center rounded-full text-sm font-semibold uppercase text-background/80 transition-all duration-100 @md:bg-text/70 @md:p-1 @md:px-2.5 @md:hover:bg-text/80 @md:hover:text-background">
      <Info class="size-5 fill-text stroke-header @md:hidden" />
      <span class="hidden @md:inline">About</span>
    </Popover.Trigger>
    <Popover.Content transition={flyAndScale} transitionConfig={{ duration: 300, y: -8 }} side="bottom" sideOffset={8} align="center" collisionPadding={8} class="z-[9999]">
      <div class="max-w-[32rem] rounded-lg bg-background-grey/95 px-8 py-4">
        {@render info()}
      </div>
    </Popover.Content>
  </Popover.Root>
{:else}
  <Drawer.Root shouldScaleBackground={true} setBackgroundColorOnScale={false}>
    <Drawer.Trigger class="relative my-3 flex shrink items-center justify-center rounded-full text-sm font-semibold uppercase text-background/80 transition-all duration-100 @md:bg-text/70 @md:p-1 @md:px-2.5 @md:hover:bg-text/80 @md:hover:text-background">
      <Info class="size-5 fill-text stroke-header @md:hidden" />
      <span class="hidden @md:inline">About</span>
    </Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Overlay class="fixed inset-0 z-[998] bg-black/80" />
      <Drawer.Content class="fixed bottom-0 left-0 right-0 z-[999] flex max-h-[calc(96%-48px)] flex-col rounded-t-[10px] bg-background-lore">
        <div class="mx-auto w-full max-w-md overflow-auto p-6">
          {@render info()}
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{/if}
