import { defineParams } from "@sveltejs/kit/params";

const uuid = /^(?:[\da-f]{32}|[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})$/i;

// Plain functions instead of a schema: matchers run in the client router on every navigation.
export const params = defineParams({
  // Minecraft username, or a player UUID with or without dashes.
  ign: (param) => (/^\w{1,16}$/.test(param) || uuid.test(param) ? param : undefined),
  // Profile cute name (a fruit or vegetable), or a profile UUID with or without dashes.
  profile: (param) => (/^[a-z]{1,20}$/i.test(param) || uuid.test(param) ? param : undefined)
});
