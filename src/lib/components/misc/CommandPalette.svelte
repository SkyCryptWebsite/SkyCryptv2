<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { getInternalState } from "$ctx";
  import { resolveUuidByUsername } from "$lib/shared/api/skycrypt-api.remote";
  import { schema } from "$routes/schema";
  import * as Command from "$ui/command";
  import { Spinner } from "$ui/spinner";
  import Search from "@lucide/svelte/icons/search";
  import { isHttpError } from "@sveltejs/kit";
  import { computeCommandScore } from "bits-ui";
  import CommandSearchGroup from "./CommandSearchGroup.svelte";
  import CommandSettingsGroup from "./CommandSettingsGroup.svelte";

  let { ign = "", loading = $bindable(false) } = $props();

  let commandValue = $state("");
  let searchQuery = $state<string>("");
  let submittedSearchLoading = $state(false);
  let submittedSearchError = $state<string>();

  const searchQueryValidated = $derived(schema.safeParse({ query: searchQuery }));
  const internalState = getInternalState();

  function getErrorMessage(err: unknown) {
    const httpError = err as { body?: unknown };

    if (
      isHttpError(err) &&
      typeof httpError.body === "object" &&
      httpError.body !== null &&
      "message" in httpError.body &&
      typeof httpError.body.message === "string"
    ) {
      return httpError.body.message;
    }

    return "Something went wrong";
  }

  function resetSearchState() {
    commandValue = "";
    searchQuery = "";
    submittedSearchLoading = false;
    submittedSearchError = undefined;
  }

  function customFilter(commandValue: string, search: string, commandKeywords?: string[]): number {
    const score = computeCommandScore(commandValue, search, commandKeywords);
    if (commandValue === "search" || commandValue === "actions") {
      return 0.98;
    }
    return score;
  }

  function setCommandOpen(open: boolean) {
    internalState.openCommand = open;
    if (!open) {
      resetSearchState();
    }
  }

  function closeCommand() {
    setCommandOpen(false);
  }

  async function submitSearch() {
    if (submittedSearchLoading || loading || !searchQueryValidated.success) return;

    const username = searchQuery.trim();
    if (!username) return;

    submittedSearchLoading = true;
    submittedSearchError = undefined;

    try {
      const response = await resolveUuidByUsername({ username });
      await goto(resolve("/stats/[ign]", { ign: response.username ?? "" }));
    } catch (err) {
      submittedSearchError = getErrorMessage(err);
    } finally {
      submittedSearchLoading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    submittedSearchError = undefined;
    if (commandValue && commandValue !== "search") return;
    const k = e.key.toLowerCase();
    if (k === "enter" || k === "search") {
      e.preventDefault();
      void submitSearch();
    }
  }
</script>

<Command.Dialog
  class="glass *:data-[slot='command']:bg-transparent standard:bg-transparent"
  bind:open={() => internalState.openCommand, setCommandOpen}
  bind:value={commandValue}
  filter={customFilter}>
  <Command.Input
    placeholder="Type a command or search..."
    bind:value={searchQuery}
    onkeydown={handleKeydown}
    disabled={submittedSearchLoading} />

  <Command.List class="">
    {#if submittedSearchError}
      <Command.Empty>
        {submittedSearchError}
      </Command.Empty>
    {:else}
      <Command.Empty>
        {#if submittedSearchError}
          {submittedSearchError}
        {:else}
          Press Enter to search
        {/if}
      </Command.Empty>
    {/if}

    <CommandSearchGroup {ign} />

    <CommandSettingsGroup {closeCommand} />

    {#if searchQuery.length && !submittedSearchError}
      <Command.Group heading="Actions">
        <Command.Item
          value="search"
          keywords={[searchQuery, "search", "find", "profile"]}
          onSelect={() => {
            void submitSearch();
          }}>
          {#if submittedSearchLoading || loading}
            <Spinner />
          {:else}
            <Search class="size-4 text-foreground" />
          {/if}

          Search for {searchQuery}
        </Command.Item>
      </Command.Group>
    {/if}
  </Command.List>
</Command.Dialog>
