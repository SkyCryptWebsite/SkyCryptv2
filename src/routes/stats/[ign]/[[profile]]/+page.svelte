<script lang="ts">
  import Main from "$lib/layouts/stats/Main.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  // (async () => {
  //   console.log(await data.user);
  // })();
</script>

<Main profile={data.user} />
