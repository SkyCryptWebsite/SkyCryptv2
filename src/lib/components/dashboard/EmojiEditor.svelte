<script lang="ts">
  import { updateEmoji } from "$routes/(protected)/dashboard/donator-perks/perks.remote";
  import * as EmojiPicker from "$ui/emoji-picker";
  import * as Popover from "$ui/popover";
  import { tick, untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { canSelectEmoji, coloredHearts, profileEmojiSchema } from "#lib/shared/profile-emoji";

  type Props = {
    account: {
      uuid: string;
      username: string;
      emoji: string | null;
      entitlementLevel: number;
    };
  };

  const { account }: Props = $props();

  let selected = $state(untrack(() => account.emoji ?? "❤️"));
  const parsed = $derived(profileEmojiSchema.safeParse(selected));
  const valid = $derived(parsed.success && canSelectEmoji(account.entitlementLevel, parsed.data));

  let saving = $state(false);
  let popoverOpen = $state(false);

  function save() {
    if (!parsed.success || !valid || saving) return;
    saving = true;
    const request = updateEmoji({ uuid: account.uuid, emoji: parsed.data });
    void request.finally(() => {
      saving = false;
    });
    toast.promise(request, {
      loading: "Saving your emoji…",
      success: `Emoji saved for ${account.username}.`,
      error: (error) => (error instanceof Error ? error.message : "Couldn’t save your emoji. Please try again.")
    });
  }
</script>

<div
  class="flex min-h-28 flex-wrap items-center justify-center gap-3 rounded-2xl border bg-foreground/5 px-4 py-6 data-disabled:pointer-events-none data-disabled:opacity-30 data-disabled:select-none"
  data-disabled={account.entitlementLevel === 0}
  aria-label="Profile emoji preview">
  <span class="text-xl sm:text-2xl">Stats for</span>
  <Popover.Root bind:open={popoverOpen}>
    <Popover.Trigger
      class="duration-150 interact:scale-95 disabled:interact:scale-100"
      disabled={account.entitlementLevel === 0 || saving}
      aria-label="Edit profile emoji">
      <span class="inline-flex min-w-0 items-center gap-3 rounded-full bg-foreground/10 py-2 pr-4 pl-2">
        <span class="truncate text-xl font-semibold sm:text-2xl">{account.username}</span>
        {#if account.entitlementLevel > 0}
          <span class="shrink-0 text-2xl" aria-label="Selected emoji">
            {valid ? parsed.data : (account.emoji ?? "")}
          </span>
        {/if}
      </span>
    </Popover.Trigger>
    <Popover.Content class="bg-transparent p-2 standard:glass">
      <EmojiPicker.Root
        disableInitialScroll
        bind:value={
          () => selected,
          (v) => {
            popoverOpen = false;
            selected = v;
            tick().then(() => save());
          }
        }
        class="contents">
        <EmojiPicker.Viewport
          class="border-0 data-[hearts-only=true]:**:data-command-group-heading:hidden"
          data-hearts-only={account.entitlementLevel < 2}>
          <div class="flex items-center justify-between gap-2">
            {#if account.entitlementLevel >= 2}
              <EmojiPicker.Search placeholder="Search emojis…" aria-label="Search emojis" disabled={saving} />
              <EmojiPicker.SkinToneSelector previewEmoji="🫶" class="mt-1 h-9 text-xl" />
            {/if}
          </div>

          <EmojiPicker.List class="h-auto" allowedEmojis={account.entitlementLevel >= 2 ? undefined : coloredHearts} />
          {#if account.entitlementLevel >= 2}
            <EmojiPicker.Footer class="flex max-w-full place-items-center gap-2 px-2">
              {#snippet children({ active })}
                <div class="flex w-[calc(100%-40px)] items-center gap-2">
                  <span class="text-lg">{active?.emoji}</span>
                  <span class="truncate text-xs text-muted-foreground">
                    {active?.data.name}
                  </span>
                </div>
              {/snippet}
            </EmojiPicker.Footer>
          {/if}
        </EmojiPicker.Viewport>
      </EmojiPicker.Root>
    </Popover.Content>
  </Popover.Root>
</div>
