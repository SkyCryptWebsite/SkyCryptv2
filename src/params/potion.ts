import type { ParamMatcher } from "@sveltejs/kit";

export const match = ((param) => {
  return typeof param === "string" && ["normal", "splash"].includes(param);
}) satisfies ParamMatcher;

export const isArmorPiece = match;
