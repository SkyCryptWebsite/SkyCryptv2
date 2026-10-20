<script lang="ts" module>
  import type { BannerVariant } from "$types";
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
  import InfoIcon from "@lucide/svelte/icons/info";
  import OctagonAlertIcon from "@lucide/svelte/icons/octagon-alert";
  import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";

  export const BANNER_LABELS: Record<BannerVariant, string> = {
    info: "Info",
    success: "Success",
    warning: "Warning",
    critical: "Critical"
  };

  // Only the icon carries the colour, except critical, which has to stand out.
  const VARIANTS = {
    info: { icon: InfoIcon, class: "glass glass-bg-popover", iconClass: "text-primary" },
    success: { icon: CircleCheckIcon, class: "glass glass-bg-popover", iconClass: "text-minecraft-a" },
    warning: { icon: TriangleAlertIcon, class: "glass glass-bg-popover", iconClass: "text-minecraft-6" },
    critical: { icon: OctagonAlertIcon, class: "bg-destructive text-white", iconClass: "" }
  } satisfies Record<BannerVariant, object>;
</script>

<script lang="ts">
  import { Button } from "$ui/button";
  import XIcon from "@lucide/svelte/icons/x";
  import { cn } from "#lib/shared/utils";

  type Props = { html: string; variant: BannerVariant; onDismiss?: () => void; class?: string };
  const { html, variant, onDismiss, class: className }: Props = $props();

  const style = $derived(VARIANTS[variant]);
</script>

<div role="status" class={cn("flex min-h-10 items-center gap-3 border-b px-4 py-1.5 text-sm", style.class, className)}>
  <style.icon class={cn("size-4 shrink-0", style.iconClass)} aria-label={BANNER_LABELS[variant]} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered on the server from the editor schema, see renderContent. -->
  <div class="min-w-0 flex-1 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4">{@html html}</div>
  {#if onDismiss}
    <Button variant="ghost" size="icon-sm" class="-me-2 shrink-0" aria-label="Dismiss banner" onclick={onDismiss}>
      <XIcon />
    </Button>
  {/if}
</div>
