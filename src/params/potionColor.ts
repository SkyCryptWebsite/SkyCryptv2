import type { ParamMatcher } from "@sveltejs/kit";

export const isPotionColor = ((param) => {
  return typeof param === "string" && parseInt(param) >= 0 && parseInt(param) <= 15;
}) satisfies ParamMatcher;

export const match = isPotionColor;
