import { Tooltip, type TooltipContentPropsWithoutHTML } from "bits-ui";
import type { ClassValue } from "svelte/elements";
import type { ModelsStrippedItem } from "#lib/shared/api/orval-generated";

type ItemTooltipPayload = {
  skyblockItem?: ModelsStrippedItem;
  inViewport?: boolean;
};

type GenericTooltipPayload = TooltipContentPropsWithoutHTML & {
  class: ClassValue | undefined | null;
  tooltipContent?: string;
  showTooltip?: boolean;
  showArrow?: boolean;
};

const itemTooltipTether = Tooltip.createTether<ItemTooltipPayload>();

const genericTooltipTether = Tooltip.createTether<GenericTooltipPayload>();

if (!itemTooltipTether || !genericTooltipTether) throw new Error("Failed to create tooltip tether");

export { genericTooltipTether, itemTooltipTether, type GenericTooltipPayload, type ItemTooltipPayload };
