import type { ParamMatcher } from "@sveltejs/kit";

export const isEmoji = ((param) => {
  return typeof param === "string" && /^[\u{1F300}-\u{1F5FF}]$/u.test(param);
}) satisfies ParamMatcher;

export const match = isEmoji;
