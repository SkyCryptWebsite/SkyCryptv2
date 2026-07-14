<script lang="ts">
  import { AdditionStat } from "$lib/components/stats";
  import { type SkycryptSrcModelsNetworthResult } from "$lib/shared/api/orval-generated";
  import { formatNumber } from "$lib/shared/helper";
  import { Label } from "$ui/label";
  import { Separator } from "$ui/separator";
  import { format as numberFormat } from "numerable";

  const defaultPattern: string = "0,0";

  type Props = {
    networth: SkycryptSrcModelsNetworthResult;
    title: string;
  };

  let { networth, title }: Props = $props();
</script>

<AdditionStat text={title} data={formatNumber(networth.networth ?? 0)} asterisk={true}>
  <div class="max-w-xs space-y-2">
    <div>
      <Label class="font-bold">{title}</Label>
      <p class="text-xs text-foreground/80 italic">{title} calculations by SkyHelper.</p>
    </div>
    <Separator />
    <ul
      class="space-y-1 [&>li]:text-foreground [&>li]:capitalize [&>li>span]:font-bold [&>li>span]:text-foreground [&>li>span]:normal-case">
      {#each Object.entries(networth.types ?? {}) as [key, value], index (index)}
        <li>
          {key.replace(/_/g, " ")}:
          <span>
            {formatNumber(value.total ?? 0)}
          </span>
        </li>
      {/each}
    </ul>

    <Separator />

    <p>
      Unsoulbound {title}:
      <span class="font-bold">
        {formatNumber(networth.unsoulboundNetworth ?? 0)}
      </span>
    </p>
    <p>
      Total {title}:
      <span class="font-bold">
        {numberFormat(networth.networth, defaultPattern)} ({formatNumber(networth.networth ?? 0)})
      </span>
    </p>
  </div>
</AdditionStat>
