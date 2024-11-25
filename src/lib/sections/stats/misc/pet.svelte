<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

<Items title="Pet Milestones">
  <div slot="text">
    <AdditionStat text="Sea Creatures Killed" data={format(misc.pet_milestones.sea_creatures_killed.total)} asterisk={true}>
      <AdditionStat text="Pet" data={misc.pet_milestones.sea_creatures_killed.rarity} dataRarityColor={misc.pet_milestones.sea_creatures_killed.rarity} />

      <AdditionStat text="Progress" data={misc.pet_milestones.sea_creatures_killed.progress === "100.00" ? "Maxed!" : `${misc.pet_milestones.sea_creatures_killed.progress}%`} dataMaxed={misc.pet_milestones.sea_creatures_killed.progress === "100.00"} />
    </AdditionStat>

    <AdditionStat text="Ores Mined" data={format(misc.pet_milestones.ores_mined.total)} asterisk={true}>
      <AdditionStat text="Pet" data={misc.pet_milestones.ores_mined.rarity} dataRarityColor={misc.pet_milestones.ores_mined.rarity} />

      <AdditionStat text="Progress" data={misc.pet_milestones.ores_mined.progress === "100.00" ? "Maxed!" : `${misc.pet_milestones.ores_mined.progress}%`} dataMaxed={misc.pet_milestones.ores_mined.progress === "100.00"} />
    </AdditionStat>
  </div>
</Items>
