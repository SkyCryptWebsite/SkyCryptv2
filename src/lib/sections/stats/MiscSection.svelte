<script lang="ts">
  import { getCombinedContext, MiscContext, setMiscContext } from "$ctx";
  import { Section } from "$lib/components/sections";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import DicesIcon from "@lucide/svelte/icons/dices";
  import Auctions from "./misc/auctions.svelte";
  import Chips from "./misc/chips.svelte";
  import Claimed from "./misc/claimed.svelte";
  import Damage from "./misc/damage.svelte";
  import Dragons from "./misc/dragons.svelte";
  import Endstone from "./misc/endstone.svelte";
  import Gifts from "./misc/gifts.svelte";
  import Jerry from "./misc/jerry.svelte";
  import Kills from "./misc/kills.svelte";
  import Mythological from "./misc/mythological.svelte";
  import Pet from "./misc/pet.svelte";
  import Uncategorized from "./misc/uncategorized.svelte";
  import Upgrades from "./misc/upgrades.svelte";

  let { order }: { order: number } = $props();

  const miscClass = new MiscContext();
  setMiscContext(miscClass);

  const misc = $derived(getCombinedContext().current?.misc);

  $effect(() => {
    miscClass.misc = misc ?? null;
  });
</script>

<Section id="Misc" {order}>
  {#if misc}
    <div class="contents space-y-4">
      <Chips />
      <!-- TODO: Essence Shop -->
      <Kills />
      <Gifts />
      <Jerry />
      <Dragons />
      <Endstone />
      <Damage />
      <Pet />
      <Mythological />
      <Upgrades />
      <Auctions />
      <Claimed />
      <Uncategorized />
    </div>
  {:else}
    <EmptyStat title="No Data" description="This player doesn't have anything related to Misc" icon={DicesIcon} />
  {/if}
</Section>
