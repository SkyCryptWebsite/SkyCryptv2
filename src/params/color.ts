import type { ParamMatcher } from "@sveltejs/kit";

export const isArmorColor = ((param) => {
  return typeof param === "string" && /^[0-9a-fA-F]{6}$/.test(param);
}) satisfies ParamMatcher;

export const match = isArmorColor;
