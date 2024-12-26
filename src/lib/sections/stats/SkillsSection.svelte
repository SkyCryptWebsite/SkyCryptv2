<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import SectionTitle from "$lib/components/SectionTitle.svelte";
  import Enchanting from "./skills/enchanting.svelte";
  import Farming from "./skills/farming.svelte";
  import Fishing from "./skills/fishing.svelte";
  import Mining from "./skills/mining.svelte";

  const { profile } = getProfileCtx();
</script>

<SectionTitle class="pt-4">Skills</SectionTitle>
{#if profile.items && profile.items.mining_tools && profile.mining}
  <Mining />
{:else}
  <p>Something went wrong</p>
{/if}
{#if profile.items && profile.items.farming_tools && profile.farming}
  <Farming />
{:else}
  <p>Something went wrong</p>
{/if}
{#if profile.items && profile.items.fishing_bag && profile.fishing}
  <Fishing />
{:else}
  <p>Something went wrong</p>
{/if}
{#if profile.enchanting}
  <Enchanting />
{:else}
  <p>Something went wrong</p>
{/if}
