<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { formatTime } from "$lib/shared/helper";
  import { Label } from "$ui/label";
  import { format } from "numerable";

  const misc = $derived(getMiscContext().misc);
  const dragons = $derived(misc?.dragons);
</script>

{#if misc && dragons}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Dragons</SectionSubtitle>
    <div class="space-y-0.5">
      {#if dragons.most_damage?.best}
        <AdditionStat text="Most Damage" data={format(dragons.most_damage.best.toFixed(0))} asterisk={true}>
          <div class="space-y-1">
            {#each Object.entries(dragons.most_damage) as [text, data], index (index)}
              {#if text !== "best"}
                <Label class="gap-1 capitalize">
                  {text.replaceAll("_", " ")}:
                  <span class="font-bold">{format(data.toFixed(0))}</span>
                </Label>
              {/if}
            {/each}
          </div>
        </AdditionStat>
      {/if}
      {#if dragons.fastest_kill?.best}
        <AdditionStat text="Fastest Kill" data={formatTime(dragons.fastest_kill.best)} asterisk={true}>
          <div class="space-y-1">
            {#each Object.entries(dragons.fastest_kill) as [text, data], index (index)}
              {#if text !== "best"}
                <Label class="gap-1 capitalize">
                  {text.replaceAll("_", " ")}:
                  <span class="font-bold">{formatTime(data)}</span>
                </Label>
              {/if}
            {/each}
          </div>
        </AdditionStat>
      {/if}
      {#if dragons.last_hits != null}
        <AdditionStat text="Last Hits" data={format(dragons.last_hits.total)} asterisk={true}>
          <div class="space-y-1">
            {#each Object.entries(dragons.last_hits) as [text, data], index (index)}
              {#if text !== "total"}
                <Label class="gap-1 capitalize">
                  {text.replaceAll("_", " ")}:
                  <span class="font-bold">{format(data)}</span>
                </Label>
              {/if}
            {/each}
          </div>
        </AdditionStat>
      {/if}
      {#if dragons.deaths != null}
        <AdditionStat text="Deaths" data={format(dragons.deaths.total)} asterisk={true}>
          <div class="space-y-1">
            {#each Object.entries(dragons.deaths) as [text, data], index (index)}
              {#if text !== "total"}
                <Label class="gap-1 capitalize">
                  {text.replaceAll("_", " ")}:
                  <span class="font-bold">{format(data)}</span>
                </Label>
              {/if}
            {/each}
          </div>
        </AdditionStat>
      {/if}
    </div>
  </div>
{/if}
