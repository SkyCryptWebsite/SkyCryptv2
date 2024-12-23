import { persisted } from "svelte-persisted-store";

// First param `favorites` is the local storage key.
// Second param is the initial value.
export const favorites = persisted<string[]>("favorites", []);
