import { untrack } from "svelte";

const MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

export class IsHover {
  #current = $state<boolean>(false);

  constructor() {
    $effect(() => {
      return untrack(() => {
        const mql = window.matchMedia(MEDIA_QUERY);
        const onChange = () => {
          this.#current = mql.matches;
        };
        mql.addEventListener("change", onChange);
        onChange();
        return () => {
          mql.removeEventListener("change", onChange);
        };
      });
    });
  }

  get current() {
    return this.#current;
  }
}
