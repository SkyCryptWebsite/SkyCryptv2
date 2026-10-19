<script lang="ts">
  import * as InputGroup from "$ui/input-group";
  import SearchIcon from "@lucide/svelte/icons/search";

  type Props = { value: string; onSearch: (value: string) => void; placeholder: string; label: string };

  let { value, onSearch, placeholder, label }: Props = $props();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function debounce(next: string) {
    clearTimeout(timeout);
    timeout = setTimeout(() => onSearch(next.trim()), 300);
  }
</script>

<InputGroup.Root class="w-full sm:max-w-xs">
  <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
  <InputGroup.Input
    type="search"
    {value}
    {placeholder}
    aria-label={label}
    oninput={(event) => debounce(event.currentTarget.value)} />
</InputGroup.Root>
