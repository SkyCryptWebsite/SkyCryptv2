<script lang="ts">
  import Header from "$lib/components/header/Header.svelte";
  import { IsHover } from "$lib/hooks/is-hover.svelte";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { setContext } from "svelte";
  import "../app.css";

  let { children } = $props();
  let isMobile = $state(new IsMobile());
  let isHover = $state(new IsHover());

  setContext("isMobile", isMobile);
  setContext("isHover", isHover);
</script>

<Header />

{@render children()}
