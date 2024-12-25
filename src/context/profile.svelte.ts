import type { ValidStats } from "$types/stats";
import { getContext, setContext } from "svelte";

class ProfileContext {
  #data = $state<ValidStats>()!;

  get profile() {
    return this.#data;
  }

  set profile(value: ValidStats) {
    this.#data = value;
  }

  constructor(profile: ValidStats) {
    this.#data = profile;
  }
}

export function setProfileCtx(profile: ValidStats) {
  const existing = getProfileCtx();
  if (existing) {
    existing.profile = profile;
    return;
  }
  setContext("profile", new ProfileContext(profile));
}

export function getProfileCtx() {
  return getContext("profile") as ProfileContext;
}
