import type { ParamMatcher } from '@sveltejs/kit';

export const isUsername = ((param) => {
	return param.length <= 24 && /^[a-zA-Z0-9_]+$/.test(param);
}) satisfies ParamMatcher;

export const match = isUsername;
