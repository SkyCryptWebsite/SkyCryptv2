<script lang="ts">
  import { genericTooltipTether, getHoverContext, getPreferences, itemTooltipTether } from "$ctx";
  import ItemContent from "$lib/components/item/item-content.svelte";
  import { cn, flyAndScale } from "$lib/shared/utils";
  import { Tooltip } from "bits-ui";

  const preferences = getPreferences();
  const isHover = getHoverContext();
</script>

<!-- Generic Tooltip -->
<Tooltip.Root tether={genericTooltipTether} disabled={!isHover.current}>
  {#snippet children({ payload })}
    {#if payload?.showTooltip !== false}
      <Tooltip.Portal>
        <Tooltip.Content
          forceMount
          class={cn(payload?.class)}
          sideOffset={payload?.sideOffset}
          side={payload?.side}
          align={payload?.align}
          customAnchor={payload?.customAnchor}>
          {#snippet child({ wrapperProps, props, open })}
            {#if open}
              <div {...wrapperProps}>
                <div {...props} transition:flyAndScale|global>
                  {#key payload}
                    {#if payload?.children}
                      {@render payload.children()}
                    {:else if payload?.tooltipContent}
                      {payload.tooltipContent}
                    {/if}
                  {/key}
                </div>
              </div>
            {/if}
          {/snippet}
        </Tooltip.Content>
      </Tooltip.Portal>
    {/if}
  {/snippet}
</Tooltip.Root>

<!-- Item Tooltip -->
<Tooltip.Root
  disableHoverableContent={true}
  ignoreNonKeyboardFocus={true}
  delayDuration={300}
  tether={itemTooltipTether}
  disabled={!isHover.current}>
  {#snippet children({ payload })}
    {#if payload?.inViewport?.current}
      <Tooltip.Portal>
        <Tooltip.Content
          forceMount={payload.inViewport.current}
          class="group/itemtooltip z-50 flex max-h-[calc(96vh-3rem)] flex-col overflow-clip font-skyblock-icons select-text data-[mctooltip=false]:rounded-xl data-[mctooltip=false]:border data-[mctooltip=false]:glass data-[mctooltip=false]:glass-bg-popover data-[mctooltip=true]:rounded-xs data-[mctooltip=true]:bg-transparent"
          side="right"
          align="center"
          collisionPadding={8}
          data-mctooltip={preferences.mctooltip}
          alignOffset={8}>
          {#snippet child({ wrapperProps, props, open })}
            {#if open}
              <div {...wrapperProps}>
                <div {...props} transition:flyAndScale>
                  {#if payload?.skyblockItem}
                    <ItemContent piece={payload.skyblockItem} />
                  {/if}
                </div>
              </div>
            {/if}
          {/snippet}
        </Tooltip.Content>
      </Tooltip.Portal>
    {/if}
  {/snippet}
</Tooltip.Root>
