<script lang="ts">
  import { cn } from "$utils";
  import "./editor.css";
  import TiptapContent from "../tiptap/components/TiptapContent.svelte";
  import { Link, TableColMenu, TableRowMenu } from "./components/menu";

  interface Props {
    class?: string;
  }
  const { class: className = "" }: Props = $props();
</script>

<Link />
<TableColMenu />
<TableRowMenu />
<TiptapContent class={cn("relative", className)} />
