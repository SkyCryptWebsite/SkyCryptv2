import { PUBLIC_RELEASE_CHANNEL } from "$app/env/public";

export const isBeta = PUBLIC_RELEASE_CHANNEL === "beta";

/** Nginx serves the beta build to requests with a `beta=true` cookie and the stable build otherwise. */
export function switchReleaseChannel() {
  document.cookie = isBeta
    ? "beta=; path=/; max-age=0; secure; samesite=lax"
    : "beta=true; path=/; max-age=31536000; secure; samesite=lax";
  location.reload();
}
