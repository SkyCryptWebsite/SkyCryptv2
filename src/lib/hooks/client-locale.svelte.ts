import { createSubscriber } from "svelte/reactivity";

const FALLBACK_LOCALE = "en-US";

/**
 * The browser's `navigator.language`, exposed reactively and SSR-safely.
 *
 * `navigator` doesn't exist (meaningfully) on the server, and reading it during the first client render would make the
 * hydrated markup disagree with the server's — a hydration mismatch for anything locale-formatted (dates, numbers).
 *
 * `createSubscriber` solves both: its `start` callback only runs once `current` is read inside an effect, which never
 * happens on the server and only happens _after_ mount on the client. So SSR and the initial hydration render both see
 * {@link FALLBACK_LOCALE}, then the value updates to the real locale once mounted.
 *
 * Safe as a module singleton: the state is only ever mutated client-side, so the server-side value is constant and
 * can't leak between requests.
 */
class ClientLocale {
  #current = $state(FALLBACK_LOCALE);
  #subscribe = createSubscriber(() => {
    this.#current = navigator.language || FALLBACK_LOCALE;
  });

  get current(): string {
    this.#subscribe();
    return this.#current;
  }
}

export const clientLocale = new ClientLocale();
