import { isUsername } from "$params/username";
import { isUUID } from "$params/uuid";

import type { ParamMatcher } from "@sveltejs/kit";

export const isPlayer = ((param) => {
  return isUsername(param) || isUUID(param);
}) satisfies ParamMatcher;

export const match = isPlayer;
