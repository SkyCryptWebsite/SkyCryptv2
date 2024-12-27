import { persisted } from "svelte-persisted-store";

// First param `packs` is the local storage key.
// Second param is the initial value.
export const theme = persisted<string>("theme", "default");
