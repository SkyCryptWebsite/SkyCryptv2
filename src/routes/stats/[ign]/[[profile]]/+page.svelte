<script lang="ts">
  import { afterNavigate, replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getInternalState, getPreferences } from "$ctx";
  import { SEO } from "$lib/components/misc";
  import { Notice } from "$lib/components/notices";
  import TooltipSetup from "$lib/components/tooltip/TooltipSetup.svelte";
  import Main from "$lib/layouts/stats/Main.svelte";
  import type { SectionName } from "$lib/sections/types";
  import type { ModelsStatsOutput } from "$lib/shared/api/orval-generated";
  import {
    getAllStats,
    getCombinedProfileStats,
    getProfileStats,
    getSelectedProfileStats
  } from "$lib/shared/api/skycrypt-api.remote";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import { type PageServerData } from "./$types";

  const { data }: { data: PageServerData } = $props();

  const preferences = getPreferences();
  const internalState = getInternalState();
  const ign = $derived(page.params.ign || "");
  const profileId = $derived(page.params.profile);
  const routeKey = $derived(`${ign}/${profileId || ""}`);
  const profileViewPromise = $derived(loadProfileView(ign, profileId));

  async function loadProfileView(uuid: string, requestedProfileId: string | undefined) {
    const allStatsPromise = getAllStats();
    const profile = requestedProfileId
      ? await getProfileStats({ uuid, profileId: requestedProfileId })
      : await getSelectedProfileStats({ uuid });
    const combinedPromise =
      profile.uuid && profile.profile_id
        ? getCombinedProfileStats({ uuid: profile.uuid, profileId: profile.profile_id })
        : Promise.resolve(null);
    const [allStats, combined] = await Promise.all([allStatsPromise, combinedPromise]);

    return { profile, allStats, combined };
  }

  function rewriteURL(profile: ModelsStatsOutput) {
    const { username, profile_cute_name } = profile;
    if (!username) return;

    const wanted = resolve("/stats/[ign]/[[profile]]", {
      ign: username,
      profile: profile_cute_name || ""
    });

    if (page.url.pathname !== wanted) {
      replaceState(wanted, page.state);
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

  afterNavigate(async ({ from, to, willUnload }) => {
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
    {#snippet pending()}
      {@render loading()}
    {/snippet}
    {#snippet failed(err, reset)}
      <div class="flex h-screen items-center justify-center">
        <Notice title="An unexpected error has occurred" type="error" error={err} retry={reset} />
      </div>
    {/snippet}

    {#await profileViewPromise}
      {@render loading()}
    {:then profileView}
      <Main data={profileView.profile} allStats={profileView.allStats} combined={profileView.combined} />
    {/await}
  </svelte:boundary>
{/key}

<TooltipSetup />
