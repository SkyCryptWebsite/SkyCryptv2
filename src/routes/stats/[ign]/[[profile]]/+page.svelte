<script lang="ts">
  import { afterNavigate, goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getInternalState, getPreferences } from "$ctx";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import { SEO } from "#lib/components/misc/index.js";
  import { Notice } from "#lib/components/notices/index.js";
  import Main from "#lib/layouts/stats/Main.svelte";
  import type { SectionName } from "#lib/sections/types.js";
  import type { ModelsStatsOutput } from "#lib/shared/api/orval-generated.js";
  import {
    getAllStats,
    getCombinedProfileStats,
    getProfileStats,
    getSelectedProfileStats,
    listEnchantments
  } from "#lib/shared/api/skycrypt-api.remote.js";
  import { createDiscordEmbed, serializeDiscordEmbed } from "#lib/shared/discordEmbed.js";
  import { type PageServerData } from "./$types";

  const { data }: { data: PageServerData } = $props();
  const discordEmbed = $derived(createDiscordEmbed(data.embed));

  const preferences = getPreferences();
  const internalState = getInternalState();
  const ign = $derived(page.params.ign || "");
  const profileId = $derived(page.params.profile);
  const routeKey = $derived(`${ign}/${profileId || ""}`);
  const profileViewPromise = $derived(loadProfileView(ign, profileId));

  async function loadProfileView(uuid: string, requestedProfileId: string | undefined) {
    const allStatsPromise = getAllStats(__PRERENDER_VERSION__);
    const enchantmentsPromise = listEnchantments(__PRERENDER_VERSION__);
    const profile = requestedProfileId
      ? await getProfileStats({ uuid, profileId: requestedProfileId })
      : await getSelectedProfileStats({ uuid });
    const combinedPromise =
      profile.uuid && profile.profile_id
        ? getCombinedProfileStats({ uuid: profile.uuid, profileId: profile.profile_id })
        : Promise.resolve(null);
    const [allStats, combined, enchantments] = await Promise.all([
      allStatsPromise,
      combinedPromise,
      enchantmentsPromise
    ]);

    return { profile, allStats, combined, enchantments };
  }

  function rewriteURL(profile: ModelsStatsOutput) {
    const { username, profile_cute_name } = profile;
    if (!username) return;

    const wanted = resolve("/stats/[ign]/[[profile]]", {
      ign: username,
      profile: profile_cute_name || ""
    });

    if (page.url.pathname !== wanted) {
      goto(wanted, { shallow: true, replace: true, state: page.state });
    }
  }

  $effect.pre(() => {
    const hash = page.url.hash;
    if (hash) {
      const sectionName = hash.substring(1) as SectionName;
      if (preferences.sectionOrder.some((section) => section.name === sectionName)) {
        internalState.tabValue = sectionName;
      }
    }
  });

  afterNavigate(async ({ from, to, willUnload, shallow, type }) => {
    if (shallow && type === "goto") return;

    if (from && to) {
      const { params: fromParams } = from;
      const { params: toParams } = to;
      if (
        fromParams &&
        toParams &&
        (fromParams.ign !== toParams.ign || fromParams.profile !== toParams.profile) &&
        !willUnload
      ) {
        internalState.openCommand = false;
      }
    }

    const navigationKey = routeKey;
    const { profile } = await profileViewPromise;
    if (navigationKey === routeKey) {
      rewriteURL(profile);
    }
  });
</script>

<svelte:head>
  {#if data.embed.username}
    <svelte:element this={"script"} id="discord:component-embed" type="application/json">
      {serializeDiscordEmbed(discordEmbed)}</svelte:element>
  {/if}
</svelte:head>

{#if data.embed}
  <SEO embedData={data.embed} />
{/if}

{#snippet loading()}
  <div class="flex h-screen items-center justify-center">
    <div class="rounded-xl glass bg-foreground/5 p-6">
      <div class="flex items-center gap-2">
        <LoaderCircle class="size-5 animate-spin text-muted-foreground" />
        <span class="font-semibold text-foreground/80">Loading profile...</span>
      </div>
    </div>
  </div>
{/snippet}

{#key routeKey}
  <svelte:boundary>
    {const profileView = await profileViewPromise}
    <Main
      data={profileView.profile}
      allStats={profileView.allStats}
      combined={profileView.combined}
      enchantments={profileView.enchantments} />

    {#snippet pending()}
      {@render loading()}
    {/snippet}

    {#snippet failed(err, reset)}
      <div class="flex h-screen items-center justify-center">
        <Notice title="An unexpected error has occurred" type="error" error={err} retry={reset} />
      </div>
    {/snippet}
  </svelte:boundary>
{/key}
