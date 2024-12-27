<script lang="ts">
  import { afterNavigate, goto } from "$app/navigation";
  import { page } from "$app/state";
  import Main from "$lib/layouts/stats/Main.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // Update the URL to include the profile if it's missing
  afterNavigate(async () => {
    const user = await data.user;
    if (!user) return;

    const { username, profile_cute_name } = user;
    if (!username) return;

    const current = page.url.pathname;
    const wanted = `/stats/${username}/${profile_cute_name || ""}`;

    if (current !== wanted) {
      const newUrl = page.url.toString().replace(current, wanted);
      goto(newUrl, { replaceState: true });
    }
  });
</script>

{#await data.user then user}
  {#if user && user.profiles}
    <Main profile={user} />
  {/if}
{/await}
