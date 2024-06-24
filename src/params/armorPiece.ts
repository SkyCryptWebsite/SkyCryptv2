import type { ParamMatcher } from "@sveltejs/kit";

export const match = ((param) => {
  return typeof param === "string" && ["boots", "leggings", "chestplate", "helmet"].includes(param);
}) satisfies ParamMatcher;

export const isArmorPiece = match;
