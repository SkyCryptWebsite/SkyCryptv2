<script lang="ts">
  import type { Component } from "svelte";
  import Layout from "../routes/(protected)/dashboard/+layout.svelte";
  import "../routes/layout.css";
  let { screen: Screen }: { screen: Component } = $props();
</script>

<div class="h-12"></div>
<Layout data={{}} params={{}}><Screen /></Layout>
