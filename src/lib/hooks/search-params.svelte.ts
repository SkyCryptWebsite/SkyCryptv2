import { goto } from "$app/navigation";
import { page } from "$app/state";

type Params = Record<string, string | number>;

/**
 * Typed URL search params with defaults, so table views are shareable and survive reloads. Values equal to their
 * default are left out of the URL; changing anything but `page` returns to page 1.
 */
export function useSearchParams<T extends Params>(defaults: T) {
  return {
    get current() {
      const values = { ...defaults };
      for (const key in defaults) {
        const raw = page.url.searchParams.get(key);
        if (raw === null) continue;
        const value = typeof defaults[key] === "number" ? Number(raw) : raw;
        if (typeof value !== "number" || Number.isFinite(value)) values[key] = value as T[typeof key];
      }
      return values;
    },
    set(updates: Partial<T>) {
      // A throwaway copy to build the next URL, so it doesn't need to be reactive.
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const url = new URL(page.url.href);
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === defaults[key]) url.searchParams.delete(key);
        else url.searchParams.set(key, String(value));
      }
      if (!("page" in updates)) url.searchParams.delete("page");
      // eslint-disable-next-line svelte/no-navigation-without-resolve -- Derived from the current URL, which includes the base path.
      return goto(url, { replace: true, reset: false });
    }
  };
}
