import { createContext } from "svelte";
import type { TabNames } from "../types";

export class CurrentTabContext {
  #current: TabNames | null = $state(null);

  get current() {
    return this.#current;
  }

  set current(value: TabNames | null) {
    this.#current = value;
  }
}

export const [getCurrentTabContext, setCurrentTabContext] = createContext<CurrentTabContext>();
