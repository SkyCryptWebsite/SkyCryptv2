<script lang="ts">
  import { getCardDataContext } from "../index";

  const { showMinecraftName = false }: { showMinecraftName?: boolean } = $props();
  const { profile } = getCardDataContext();

  const rankColor = $derived(profile?.rank?.rankColor ?? "white");
  const plusColor = $derived(profile?.rank?.plusColor ?? profile?.rank?.rankColor ?? "white");
  const rankPlusText = $derived(profile?.rank?.plusText ?? "");
</script>

<div class="relative flex h-full w-[30vw] shrink-0 flex-col items-center justify-center-safe">
  {#if showMinecraftName}
    <div class="flex justify-center-safe">
      <p class="inline-flex bg-black/50 px-2 font-minecraft text-2xl" style="color: {rankColor};">
        <span>&#91;{profile?.rank?.rankText} </span>
        {#if rankPlusText}
          <span style="color: {plusColor};">{rankPlusText}</span>
        {/if}
        <span>&#93; {profile?.username} </span>
      </p>
    </div>
  {/if}
  <img
    src="https://nmsr.nickac.dev/fullbody/{profile?.uuid}?no=shadow"
    alt={profile?.username}
    class="relative h-full object-cover" />
</div>
