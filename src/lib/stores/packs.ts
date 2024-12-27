import { persisted } from "svelte-persisted-store";

// First param `packs` is the local storage key.
// Second param is the initial value.
export const disabledPacks = persisted<string[]>("disabledPacks", []);
