<script lang="ts">
  import { PUBLIC_PATREON_ANY_EMOJI_CENTS, PUBLIC_PATREON_COLORED_HEART_CENTS, PUBLIC_PATREON } from "$app/env/public";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { coloredHearts } from "$src/lib/shared/profile-emoji";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Empty from "$ui/empty";
  import * as Field from "$ui/field";
  import * as Item from "$ui/item";
  import { Progress } from "$ui/progress";
  import { Spinner } from "$ui/spinner";
  import emojiData, { type EmojiMartData } from "@emoji-mart/data";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import { PersistedState } from "runed";
  import { onMount, tick } from "svelte";
  import { toast } from "svelte-sonner";
  import { quartOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import EmojiEditor from "#lib/components/dashboard/EmojiEditor.svelte";
  import LinkAccount from "#lib/components/dashboard/LinkAccount.svelte";
  import { getDashboard, verifyMembership } from "../dashboard.remote";
  import { getPerks } from "./perks.remote";

  const emojis = emojiData as EmojiMartData;

  const dashboard = $derived(await getDashboard());
  const membership = $derived(dashboard.membership);
  const linked = $derived(dashboard.accounts.some((account) => account.providerId === "patreon"));
  const minecraftLinked = $derived(dashboard.accounts.some((account) => account.providerId === "mc-id"));
  const retryTimes = new PersistedState<Record<string, number>>("skycryptPatreonRetryTimes", {});
  const savedRetryAt = $derived(retryTimes.current?.[dashboard.user.id] ?? 0);

  const retryAt = $derived(
    Math.max(dashboard.verificationRetryAt?.getTime() ?? 0, Number.isFinite(savedRetryAt) ? savedRetryAt : 0)
  );

  let now = $state(Date.now());
  const cooldownSeconds = $derived(Math.max(0, Math.ceil((retryAt - now) / 1000)));

  const randomEmojis = Object.values(emojis.emojis)
    .filter((emoji) => emoji.skins[0].native.length === 2)
    .map((emoji) => emoji.skins[0].native);

  let checkAfterLink = $derived(
    linked && page.url.searchParams.get("linked") === "patreon" && !page.url.searchParams.has("error")
  );

  let randomHeartEmoji = $state(coloredHearts[Math.floor(Math.random() * coloredHearts.length)]);
  let randomEmoji = $state(randomEmojis[Math.floor(Math.random() * randomEmojis.length)]);

  const money = (cents: number) =>
    new Intl.NumberFormat(navigator.language || "en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  async function verify() {
    if (cooldownSeconds || verifyMembership.pending) return;
    retryTimes.current = { ...retryTimes.current, [dashboard.user.id]: Date.now() + 60_000 };

    toast.promise(verifyMembership(), {
      loading: "Verifying your membership…",
      success: "Membership verified.",
      error: (error) => (error instanceof Error ? error.message : "Couldn’t verify your membership. Please try again.")
    });
  }

  setInterval(() => {
    let newHeartEmoji;
    do {
      newHeartEmoji = coloredHearts[Math.floor(Math.random() * coloredHearts.length)];
    } while (newHeartEmoji === randomHeartEmoji);
    randomHeartEmoji = newHeartEmoji;
  }, 1000);

  setInterval(() => {
    let newEmoji;
    do {
      newEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
    } while (newEmoji === randomEmoji);
    randomEmoji = newEmoji;
  }, 1000);

  onMount(() => {
    if (page.url.searchParams.has("linked")) {
      const url = new URL(page.url.href);
      url.searchParams.delete("linked");
      // eslint-disable-next-line svelte/no-navigation-without-resolve -- The current URL already includes the base path.
      goto(url, { shallow: true, replace: true, state: page.state });
    }
    function checkWhenReady() {
      if (checkAfterLink && !cooldownSeconds && !verifyMembership.pending) {
        checkAfterLink = false;
        void verify();
      }
    }
    tick().then(checkWhenReady);
    const timer = setInterval(() => {
      now = Date.now();
      checkWhenReady();
    }, 1000);
    return () => clearInterval(timer);
  });
</script>

<svelte:head><title>Donator Perks | SkyCrypt</title></svelte:head>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <h1 class="text-3xl font-semibold text-balance">Donator Perks</h1>
      <Card.Description>Unlock profile emojis as a donator</Card.Description>
    </Card.Header>
    <Card.Content class="flex gap-3">
      <Item.Root>
        <Item.Media
          variant="icon"
          class="grid aspect-square h-auto grid-cols-1 grid-rows-1 rounded-full bg-foreground/5 p-4 text-2xl select-none">
          {#key randomHeartEmoji}
            {let currentState = $state("open")}
            <span
              data-state={currentState}
              transition:fade={{ duration: 700, delay: 0, easing: quartOut }}
              onintrostart={() => (currentState = "open")}
              onoutrostart={() => (currentState = "closed")}
              class="col-start-1 row-start-1 motion-scale-in-80 motion-blur-in-xs data-[state=closed]:motion-scale-out-80 data-[state=closed]:motion-blur-out-xs"
              >{randomHeartEmoji}</span>
          {/key}
        </Item.Media>
        <Item.Content>
          <Item.Title>Colored Heart</Item.Title>
          <Item.Description>{money(Number(PUBLIC_PATREON_COLORED_HEART_CENTS))} in total support</Item.Description>
        </Item.Content>
      </Item.Root>
      <Item.Root>
        <Item.Media
          variant="icon"
          class="grid aspect-square h-auto grid-cols-1 grid-rows-1 rounded-full bg-foreground/5 p-4 text-2xl select-none">
          {#key randomEmoji}
            {let currentState = $state("open")}
            <span
              data-state={currentState}
              transition:fade={{ duration: 700, delay: 0, easing: quartOut }}
              onintrostart={() => (currentState = "open")}
              onoutrostart={() => (currentState = "closed")}
              class="col-start-1 row-start-1 motion-scale-in-80 motion-blur-in-xs data-[state=closed]:motion-scale-out-80 data-[state=closed]:motion-blur-out-xs"
              >{randomEmoji}</span>
          {/key}
        </Item.Media>
        <Item.Content>
          <Item.Title>Any Emoji</Item.Title>
          <Item.Description>{money(Number(PUBLIC_PATREON_ANY_EMOJI_CENTS))} in total support</Item.Description>
        </Item.Content>
      </Item.Root>
    </Card.Content>
  </Card.Root>

  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <Card.Title>Profile Emojis</Card.Title>
      <Card.Description>Manage your profile emojis</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-6">
      <svelte:boundary>
        {#snippet pending()}
          <Spinner />
        {/snippet}
        {#each await getPerks() as account (account.uuid)}
          {#key account.emoji}
            <EmojiEditor {account} />
          {/key}
        {:else}
          <Card.Root class="rounded-none glass p-0 shadow-none ring-0 glass-bg-card standard:bg-transparent">
            <Card.Content class="overflow-visible rounded-none p-0">
              <Empty.Root class="w-full border">
                <Empty.Header>
                  <Empty.Title>Connect your Minecraft account</Empty.Title>
                  <Empty.Description>
                    You need to connect your Minecraft account to choose your profile emoji. You can connect your
                    account through the button below.
                  </Empty.Description>
                </Empty.Header>
                <Empty.Content class="flex">
                  <LinkAccount
                    provider="mc-id"
                    reconnect={minecraftLinked}
                    callbackURL="/(protected)/dashboard/donator-perks" />
                  {#if minecraftLinked}
                    <Button variant="outline" href="/dashboard">Sync Minecraft accounts</Button>
                  {/if}
                </Empty.Content>
              </Empty.Root>
            </Card.Content>
          </Card.Root>
        {/each}
      </svelte:boundary>
    </Card.Content>
  </Card.Root>

  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <Card.Title>Patreon support</Card.Title>
      <Card.Description>Check your lifetime support to unlock your emoji perks.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-3">
      {#if membership}
        <div class="relative w-full">
          <Field.Field class="w-full max-w-sm">
            <Field.Label for="progress-donator-perks" class="w-full">
              <span> Lifetime support</span>
              <span class="ml-auto font-normal text-muted-foreground tabular-nums">
                {money(membership.lifetimeSupportCents)} /{" "}
                {money(Number(PUBLIC_PATREON_ANY_EMOJI_CENTS))}
              </span>
            </Field.Label>
            <div class="relative w-full">
              <Progress
                class="border bg-transparent *:data-[slot=progress-indicator]:bg-foreground"
                value={membership.lifetimeSupportCents}
                max={Number(PUBLIC_PATREON_ANY_EMOJI_CENTS)}
                id="progress-donator-perks" />

              <div
                class="absolute right-0 bottom-0 left-0 h-full w-full overflow-clip rounded-full border border-transparent">
                <div
                  class="absolute top-1/2 left-0 h-full w-0.5 -translate-y-1/2 bg-border"
                  style="left: calc((100% * {PUBLIC_PATREON_COLORED_HEART_CENTS}) / {PUBLIC_PATREON_ANY_EMOJI_CENTS})">
                </div>

                <div class="absolute top-1/2 right-px h-full w-0.5 -translate-y-1/2 bg-border"></div>
              </div>
            </div>
            <div class="relative w-full -translate-y-3">
              <span class="relative text-xs whitespace-nowrap text-muted-foreground"> Colored Heart </span>

              <span class="absolute top-1/2 -right-6 -translate-y-1/2 text-xs whitespace-nowrap text-muted-foreground">
                Any Emoji
              </span>
            </div>
          </Field.Field>
        </div>
      {:else}
        <p class="text-sm text-muted-foreground">
          {#if linked}
            Your Patreon account is connected. Your lifetime support determines your emoji perks
          {:else}
            Already a patron? Link your account to check your support automatically
          {/if}
        </p>
      {/if}
    </Card.Content>
    <Card.Footer class="flex flex-wrap gap-2">
      {#if !linked}
        <LinkAccount provider="patreon" callbackURL="/(protected)/dashboard/donator-perks" />
      {:else}
        <Button
          variant="outline"
          class="tabular-nums"
          aria-busy={!!verifyMembership.pending}
          onclick={verify}
          disabled={!!verifyMembership.pending || cooldownSeconds > 0}>
          {#if verifyMembership.pending}
            <Spinner data-icon="inline-start" />
          {:else}
            <RefreshCwIcon data-icon="inline-start" />
          {/if}

          {#if verifyMembership.pending}
            Checking…
          {:else if cooldownSeconds > 0}
            Check again in {cooldownSeconds}s
          {:else}
            Check support
          {/if}
        </Button>
      {/if}
      <Button variant="outline" href={PUBLIC_PATREON} target="_blank" rel="noopener noreferrer">
        Support SkyCrypt <ExternalLinkIcon />
      </Button>
    </Card.Footer>
  </Card.Root>
</div>
