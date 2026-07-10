<script lang="ts" module>
  export const [getDefaultCardDataContext, setDefaultCardDataContext] = createContext<DefaultCardData>();
  export const [getDefaultCardSettingsContext, setDefaultCardSettingsContext] = createContext<DefaultCardSettings>();
</script>

<script lang="ts">
  import { createContext } from "svelte";
  import { setCardDataContext } from "..";
  import Player from "../components/Player.svelte";
  import type { DefaultCardData, DefaultCardProps, DefaultCardSettings } from "./index";
  import Profile from "./Profile.svelte";
  import Skills from "./Skills.svelte";
  import Stats from "./Stats.svelte";

  type Props = DefaultCardProps;

  const { profile, networth, dungeons, settings }: Props = $props();

  // svelte-ignore state_referenced_locally
  setCardDataContext({ profile });

  // svelte-ignore state_referenced_locally
  setDefaultCardDataContext({
    networth,
    dungeons
  });

  // svelte-ignore state_referenced_locally
  setDefaultCardSettingsContext({
    ...settings
  });

  // The per-render keyed image is referenced via background-image CSS rather than
  // an absolutely-positioned <img>: takumi-js 1.1.x reworked inline-formatting-
  // context detection (commit adc48da, "Treat absolute/floated children as
  // out-of-flow"), which left the previous <img class="absolute inset-0">
  // background unrendered. The CSS pattern is the one shown in the takumi
  // docs ("The image key can be used in any `src` field or `background-image`,
  // `mask-image` CSS property.") and is robust against further layout changes.
  const mainStyle = $derived(["background-image: url(skycrypt-background)", "background-size: cover", "background-position: center", settings?.border && settings?.borderColor ? `border: 2px solid ${settings.borderColor}` : null].filter(Boolean).join("; "));
</script>

<main class="relative dark h-85 w-375 overflow-hidden rounded-xl" style={mainStyle}>
  <div class="flex h-full w-full items-start justify-start">
    <Player showMinecraftName={settings?.showMinecraftName ?? false} />
    <div
      class="relative z-50 flex h-full w-full flex-col gap-y-1.5 overflow-hidden rounded-xl p-2 px-4 backdrop-blur-lg
backdrop-brightness-50">
      <Profile />
      <Skills />
      <Stats />
    </div>
  </div>

  <footer>
    <div class="absolute bottom-4 left-4 flex items-center justify-center gap-2 text-base font-bold text-white" data-sveltekit-preload-data="hover">
      <img src="skycrypt-logo" alt="SkyCrypt" class="pointer-events-none size-6 select-none" />
      <span>SkyCrypt</span>
    </div>
  </footer>
</main>
