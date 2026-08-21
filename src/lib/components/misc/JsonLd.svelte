<script lang="ts">
  type Props = {
    data: Record<string, unknown> | ReadonlyArray<Record<string, unknown>>;
  };

  const { data }: Props = $props();

  /**
   * Serialise JSON for embedding inside a `<script>` element.
   *
   * `JSON.stringify` does not escape `<`, `>` or `&`, so a string containing the closing script sequence would close
   * the tag and allow arbitrary HTML/JS injection. Replacing those three with their unicode escapes keeps the payload
   * safely contained, and `JSON.parse` decodes the escapes back to the original characters — so the data still
   * round-trips losslessly for crawlers.
   *
   * https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
   */
  function safeJsonLd(value: unknown): string {
    return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
  }

  const json = $derived(safeJsonLd(data));
</script>

<svelte:head>
  <svelte:element this={"script"} type="application/ld+json">{json}</svelte:element>
</svelte:head>
