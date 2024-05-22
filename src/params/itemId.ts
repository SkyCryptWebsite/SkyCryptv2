import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return typeof param === 'string';
}) satisfies ParamMatcher;

export const isItemId = match;
