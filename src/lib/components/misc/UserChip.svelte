<script lang="ts">
  import type { PublicProfile } from "$types";
  import * as Avatar from "$ui/avatar";
  import * as HoverCard from "$ui/hover-card";
  import * as Popover from "$ui/popover";
  import { MediaQuery } from "svelte/reactivity";
  import { cn } from "#lib/shared/utils.js";

  type Props = {
    profile: PublicProfile | null;
    /** `lg` for bylines that stand on their own, like the post header. */
    size?: "sm" | "lg";
    class?: string;
  };

  const { profile, size = "sm", class: className }: Props = $props();

  // Touch screens can't hover, so they open the profile with a tap instead.
  const canHover = new MediaQuery("(hover: hover) and (pointer: fine)", true);
  const label = $derived(profile?.minecraft?.username ?? profile?.name ?? "Deleted user");
  const initials = (name: string) => name.slice(0, 2).toUpperCase();
</script>

{#snippet face()}
  <Avatar.Root
    class={cn("shrink-0 rounded-none after:rounded-none", size === "sm" ? "size-4" : "size-8")}
    aria-hidden="true">
    {#if profile?.minecraft}
      <Avatar.Image
        src="https://nmsr.nickac.dev/face/{profile.minecraft.uuid}"
        alt=""
        loading="lazy"
        class="rounded-none [image-rendering:pixelated]" />
    {/if}
    <Avatar.Fallback class="rounded-none text-[0.5rem] font-semibold">{initials(label)}</Avatar.Fallback>
  </Avatar.Root>
{/snippet}

{#snippet card()}
  {#if profile}
    <div class="flex items-center gap-3">
      <Avatar.Root class="size-12">
        {#if profile.avatarUrl}<Avatar.Image src={profile.avatarUrl} alt="" loading="lazy" />{/if}
        <Avatar.Fallback>{initials(profile.name)}</Avatar.Fallback>
      </Avatar.Root>
      <div class="flex min-w-0 flex-col">
        <span class="truncate font-semibold text-foreground">{profile.name}</span>
        {#if profile.discordUsername}
          <span class="truncate text-sm text-muted-foreground">@{profile.discordUsername}</span>
        {/if}
      </div>
    </div>
  {/if}
{/snippet}

{#snippet triggerContent()}
  {@render face()}
  <span class="truncate">{label}</span>
{/snippet}

{#if !profile}
  <span class={cn("inline-flex min-w-0 items-center gap-2", className)}>{@render triggerContent()}</span>
{:else if canHover.current}
  <HoverCard.Root openDelay={300}>
    <HoverCard.Trigger>
      {#snippet child({ props })}
        <button
          type="button"
          {...props}
          class={cn("relative z-10 inline-flex min-w-0 items-center gap-2 rounded-sm hover:underline", className)}>
          {@render triggerContent()}
        </button>
      {/snippet}
    </HoverCard.Trigger>
    <HoverCard.Content class="w-auto max-w-80">{@render card()}</HoverCard.Content>
  </HoverCard.Root>
{:else}
  <Popover.Root>
    <Popover.Trigger
      class={cn("relative z-10 inline-flex min-w-0 items-center gap-2 rounded-sm", className)}
      aria-label="{label}, show profile">
      {@render triggerContent()}
    </Popover.Trigger>
    <Popover.Content class="w-auto max-w-80">{@render card()}</Popover.Content>
  </Popover.Root>
{/if}
